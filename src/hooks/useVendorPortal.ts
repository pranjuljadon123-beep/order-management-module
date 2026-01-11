import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Rfq, RfqLane, Quote, Surcharge } from '@/types/procurement';

export interface VendorInvitation {
  id: string;
  rfq_id: string;
  carrier_id: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  rfq?: Rfq;
}

// Get RFQs that this vendor has been invited to
export function useVendorRfqs() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['vendor-rfqs', profile?.carrier_id],
    queryFn: async () => {
      if (!profile?.carrier_id) return [];

      // Get all invitations for this carrier
      const { data: invitations, error: invError } = await supabase
        .from('vendor_invitations')
        .select('*')
        .eq('carrier_id', profile.carrier_id);

      if (invError) throw invError;
      if (!invitations || invitations.length === 0) return [];

      // Get RFQ details for each invitation
      const rfqIds = invitations.map(inv => inv.rfq_id);
      
      const { data: rfqs, error: rfqError } = await supabase
        .from('rfqs')
        .select(`
          *,
          lanes:rfq_lanes(*)
        `)
        .in('id', rfqIds)
        .in('status', ['published', 'bidding', 'evaluation'])
        .order('created_at', { ascending: false });

      if (rfqError) throw rfqError;

      // Merge invitation data with RFQ data
      return (rfqs || []).map(rfq => ({
        ...rfq,
        invitation: invitations.find(inv => inv.rfq_id === rfq.id),
      })) as (Rfq & { invitation: VendorInvitation })[];
    },
    enabled: !!profile?.carrier_id,
  });
}

// Get a single RFQ with lanes for vendor view
export function useVendorRfq(rfqId: string) {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['vendor-rfq', rfqId, profile?.carrier_id],
    queryFn: async () => {
      if (!profile?.carrier_id) return null;

      // Verify invitation exists
      const { data: invitation, error: invError } = await supabase
        .from('vendor_invitations')
        .select('*')
        .eq('rfq_id', rfqId)
        .eq('carrier_id', profile.carrier_id)
        .single();

      if (invError) throw new Error('Not invited to this RFQ');

      // Get RFQ details
      const { data: rfq, error: rfqError } = await supabase
        .from('rfqs')
        .select(`
          *,
          lanes:rfq_lanes(*)
        `)
        .eq('id', rfqId)
        .single();

      if (rfqError) throw rfqError;

      return { rfq: rfq as Rfq, invitation: invitation as VendorInvitation };
    },
    enabled: !!rfqId && !!profile?.carrier_id,
  });
}

// Get vendor's own quotes for an RFQ
export function useVendorQuotes(rfqId: string) {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['vendor-quotes', rfqId, profile?.carrier_id],
    queryFn: async () => {
      if (!profile?.carrier_id) return [];

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          lane:rfq_lanes(*)
        `)
        .eq('rfq_id', rfqId)
        .eq('carrier_id', profile.carrier_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as (Quote & { lane: RfqLane })[];
    },
    enabled: !!rfqId && !!profile?.carrier_id,
  });
}

// Submit a quote as vendor
export function useVendorSubmitQuote() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (input: {
      rfq_id: string;
      lane_id: string;
      base_freight_rate: number;
      currency?: string;
      rate_unit?: string;
      transit_time_days?: number;
      validity_start?: string;
      validity_end?: string;
      surcharges?: Surcharge[];
      notes?: string;
    }) => {
      if (!profile?.carrier_id) throw new Error('No carrier linked to profile');

      // Generate quote number
      const { data: quoteNumber } = await supabase.rpc('generate_quote_number');

      // Calculate total landed cost
      const surchargesTotal = (input.surcharges || []).reduce((sum, s) => {
        return sum + (s.type === 'fixed' ? s.amount : input.base_freight_rate * (s.amount / 100));
      }, 0);
      const totalLandedCost = input.base_freight_rate + surchargesTotal;

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          quote_number: quoteNumber as string,
          rfq_id: input.rfq_id,
          lane_id: input.lane_id,
          carrier_id: profile.carrier_id,
          quote_type: 'contract',
          base_freight_rate: input.base_freight_rate,
          currency: input.currency || 'USD',
          rate_unit: input.rate_unit || 'per container',
          transit_time_days: input.transit_time_days,
          validity_start: input.validity_start,
          validity_end: input.validity_end,
          surcharges: input.surcharges as any || [],
          total_landed_cost: totalLandedCost,
          notes: input.notes,
          status: 'submitted',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-quotes', variables.rfq_id] });
      toast.success('Quote submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit quote: ' + error.message);
    },
  });
}

// Accept invitation
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase
        .from('vendor_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-rfqs'] });
      toast.success('Invitation accepted');
    },
    onError: (error) => {
      toast.error('Failed to accept invitation: ' + error.message);
    },
  });
}
