import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  deriveRfqStatus,
  canTransition,
  ARCHIVE_RETENTION_DAYS,
  type RfqWorkflowStatus,
} from '@/lib/rfqWorkflow';

/**
 * Persists a workflow-status transition on a single RFQ record.
 * The legacy `status` column is mirrored so older screens stay consistent.
 */
const LEGACY_MIRROR: Record<RfqWorkflowStatus, string> = {
  OPEN: 'bidding',
  UNDER_NEGOTIATION: 'evaluation',
  MY_APPROVAL: 'evaluation',
  CONFIRMED: 'awarded',
  CLOSED: 'expired',
  ARCHIVED: 'expired',
  CANCELLED: 'cancelled',
};

export function useSetRfqWorkflowStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rfqId,
      status,
      silent,
    }: {
      rfqId: string;
      status: RfqWorkflowStatus;
      silent?: boolean;
    }) => {
      const { data: current } = await supabase.from('rfqs').select('*').eq('id', rfqId).single();
      const from = current ? deriveRfqStatus(current).status : 'OPEN';
      if (from !== status && !canTransition(from, status)) {
        throw new Error(`Cannot move an RFQ from ${from} to ${status}.`);
      }

      const patch: Record<string, unknown> = {
        workflow_status: status,
        status: LEGACY_MIRROR[status],
        status_changed_at: new Date().toISOString(),
      };
      if (status === 'ARCHIVED') {
        patch.terminal_status = (current?.terminal_status as string) || from;
        patch.archived_at = new Date().toISOString();
      }

      const { data, error } = await supabase.from('rfqs').update(patch).eq('id', rfqId).select().single();
      if (error) throw error;
      return { data, silent };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['rfqs'] });
      qc.invalidateQueries({ queryKey: ['rfq'] });
      qc.invalidateQueries({ queryKey: ['auction-rfqs'] });
      if (!res?.silent) toast.success('RFQ status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/**
 * Confirm a vendor quote for part or all of the RFQ's required quantity.
 * Locks the quote, records the award and moves the RFQ to CONFIRMED
 * (or CLOSED once every unit is allocated).
 */
export function useConfirmQuote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      rfqId: string;
      laneId: string;
      quoteId: string;
      carrierId: string;
      awardedRate: number;
      currency?: string;
      allocatedQuantity: number;
      rationale?: string;
    }) => {
      const { data: rfq } = await supabase.from('rfqs').select('*').eq('id', input.rfqId).single();
      const required = Number(rfq?.required_quantity) || 0;
      const allocated = Number(rfq?.allocated_quantity) || 0;
      const remaining = required > 0 ? required - allocated : Infinity;

      if (input.allocatedQuantity <= 0) throw new Error('Allocate at least one unit.');
      if (input.allocatedQuantity > remaining) {
        throw new Error(
          `Cannot allocate ${input.allocatedQuantity} — only ${remaining} of ${required} unit(s) remain on this RFQ.`
        );
      }

      const { data: awardNumber } = await supabase.rpc('generate_award_number');
      const nextAllocated = allocated + input.allocatedQuantity;
      const fully = required > 0 && nextAllocated >= required;

      const { error } = await supabase.from('awards').insert({
        award_number: awardNumber,
        rfq_id: input.rfqId,
        lane_id: input.laneId,
        quote_id: input.quoteId,
        carrier_id: input.carrierId,
        award_type: fully && allocated === 0 ? 'full' : 'split',
        allocation_percentage: required > 0 ? Math.round((input.allocatedQuantity / required) * 100) : 100,
        allocated_quantity: input.allocatedQuantity,
        awarded_rate: input.awardedRate,
        currency: input.currency || 'USD',
        rationale: input.rationale,
        status: 'active',
      });
      if (error) throw error;

      await supabase.from('quotes').update({ status: 'accepted' }).eq('id', input.quoteId);

      // A quote confirmation never skips straight to CLOSED — only full allocation does.
      await supabase
        .from('rfqs')
        .update({
          allocated_quantity: nextAllocated,
          workflow_status: fully ? 'CLOSED' : 'CONFIRMED',
          status: fully ? 'expired' : 'awarded',
          status_changed_at: new Date().toISOString(),
        })
        .eq('id', input.rfqId);

      if (fully) {
        await supabase.from('rfq_lanes').update({ is_awarded: true }).eq('id', input.laneId);
      }

      return { fully, nextAllocated, required };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfqs'] });
      qc.invalidateQueries({ queryKey: ['rfq'] });
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['awards'] });
      qc.invalidateQueries({ queryKey: ['auction-rfqs'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/**
 * Background job: expires bid windows and archives terminal RFQs after the
 * retention window. Runs on mount and every 60s — no manual "archive" click.
 */
export function useRfqBackgroundJobs(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase.from('rfqs').select('*');
      if (!data || cancelled) return;
      let changed = false;

      for (const rfq of data as any[]) {
        const derived = deriveRfqStatus(rfq);
        const persisted = rfq.workflow_status;
        if (derived.status === persisted) continue;

        const patch: Record<string, unknown> = {
          workflow_status: derived.status,
          status: LEGACY_MIRROR[derived.status],
        };
        if (derived.status === 'ARCHIVED') {
          patch.terminal_status = derived.terminal || rfq.terminal_status || 'CLOSED';
          patch.archived_at = rfq.archived_at || new Date().toISOString();
        }
        await supabase.from('rfqs').update(patch).eq('id', rfq.id);
        changed = true;
      }

      if (changed && !cancelled) {
        qc.invalidateQueries({ queryKey: ['rfqs'] });
        qc.invalidateQueries({ queryKey: ['auction-rfqs'] });
      }
    };

    run();
    const t = setInterval(run, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [enabled, qc]);
}

export { ARCHIVE_RETENTION_DAYS };
