import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Rfq, RfqLane, Quote, Award, RateCard, Carrier,
  CreateRfqInput, CreateQuoteInput, CreateAwardInput,
  ProcurementStats, Surcharge
} from '@/types/procurement';
import { toast } from 'sonner';

// Carriers
export function useCarriers() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Carrier[];
    },
  });
}

// RFQs
export function useRfqs(status?: string) {
  return useQuery({
    queryKey: ['rfqs', status],
    queryFn: async () => {
      let query = supabase
        .from('rfqs')
        .select(`
          *,
          lanes:rfq_lanes(*),
          quotes(*)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Rfq[];
    },
  });
}

export function useRfq(id: string) {
  return useQuery({
    queryKey: ['rfq', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          lanes:rfq_lanes(*),
          quotes(*, carrier:carriers(*))
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Rfq;
    },
    enabled: !!id,
  });
}

export function useCreateRfq() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateRfqInput & { invited_vendors?: string[] }) => {
      // Generate RFQ number
      const { data: rfqNumber } = await supabase.rpc('generate_rfq_number');
      
      // Create RFQ
      const { data: rfq, error: rfqError } = await supabase
        .from('rfqs')
        .insert({
          rfq_number: rfqNumber,
          title: input.title,
          mode: input.mode,
          incoterms: input.incoterms,
          contract_duration_months: input.contract_duration_months,
          estimated_annual_volume: input.estimated_annual_volume,
          bid_deadline: input.bid_deadline,
          valid_from: input.valid_from,
          valid_to: input.valid_to,
          notes: input.notes,
          status: 'draft',
        })
        .select()
        .single();
      
      if (rfqError) throw rfqError;
      
      // Create lanes
      if (input.lanes.length > 0) {
        const lanes = input.lanes.map((lane, index) => ({
          rfq_id: rfq.id,
          lane_number: index + 1,
          ...lane,
        }));
        
        const { error: lanesError } = await supabase
          .from('rfq_lanes')
          .insert(lanes);
        
        if (lanesError) throw lanesError;
      }
      
      // Create vendor invitations for selected carriers
      if (input.invited_vendors && input.invited_vendors.length > 0) {
        const invitations = input.invited_vendors.map(carrierId => ({
          rfq_id: rfq.id,
          carrier_id: carrierId,
          status: 'pending',
        }));
        
        const { error: invitationsError } = await supabase
          .from('vendor_invitations')
          .insert(invitations);
        
        if (invitationsError) throw invitationsError;
      }
      
      return rfq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create RFQ: ' + error.message);
    },
  });
}

export function useUpdateRfqStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('rfqs')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ status updated');
    },
    onError: (error) => {
      toast.error('Failed to update RFQ: ' + error.message);
    },
  });
}

// Quotes
export function useQuotesByRfq(rfqId: string) {
  return useQuery({
    queryKey: ['quotes', 'rfq', rfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          carrier:carriers(*),
          lane:rfq_lanes(*)
        `)
        .eq('rfq_id', rfqId)
        .order('total_landed_cost', { ascending: true });
      
      if (error) throw error;
      return data as Quote[];
    },
    enabled: !!rfqId,
  });
}

export function useQuotesByLane(laneId: string) {
  return useQuery({
    queryKey: ['quotes', 'lane', laneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          carrier:carriers(*)
        `)
        .eq('lane_id', laneId)
        .eq('status', 'submitted')
        .order('total_landed_cost', { ascending: true });
      
      if (error) throw error;
      return data as Quote[];
    },
    enabled: !!laneId,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateQuoteInput) => {
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
          carrier_id: input.carrier_id,
          quote_type: input.quote_type,
          base_freight_rate: input.base_freight_rate,
          currency: input.currency || 'USD',
          rate_unit: input.rate_unit,
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
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['rfq', variables.rfq_id] });
      toast.success('Quote submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit quote: ' + error.message);
    },
  });
}

// Awards
export function useAwardsByRfq(rfqId: string) {
  return useQuery({
    queryKey: ['awards', 'rfq', rfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('awards')
        .select(`
          *,
          carrier:carriers(*),
          lane:rfq_lanes(*),
          quote:quotes(*)
        `)
        .eq('rfq_id', rfqId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Award[];
    },
    enabled: !!rfqId,
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateAwardInput) => {
      // Generate award number
      const { data: awardNumber } = await supabase.rpc('generate_award_number');
      
      const { data, error } = await supabase
        .from('awards')
        .insert({
          award_number: awardNumber,
          rfq_id: input.rfq_id,
          lane_id: input.lane_id,
          quote_id: input.quote_id,
          carrier_id: input.carrier_id,
          award_type: input.award_type || 'full',
          allocation_percentage: input.allocation_percentage || 100,
          awarded_rate: input.awarded_rate,
          currency: input.currency || 'USD',
          rationale: input.rationale,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update quote status
      await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', input.quote_id);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['rfq', variables.rfq_id] });
      toast.success('Lane awarded successfully');
    },
    onError: (error) => {
      toast.error('Failed to create award: ' + error.message);
    },
  });
}

export function useLockAward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (awardId: string) => {
      const { data, error } = await supabase
        .from('awards')
        .update({ is_locked: true })
        .eq('id', awardId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      toast.success('Award locked');
    },
    onError: (error) => {
      toast.error('Failed to lock award: ' + error.message);
    },
  });
}

// Rate Cards
export function useRateCards(active?: boolean) {
  return useQuery({
    queryKey: ['rate-cards', active],
    queryFn: async () => {
      let query = supabase
        .from('rate_cards')
        .select(`
          *,
          carrier:carriers(*)
        `)
        .order('created_at', { ascending: false });
      
      if (active !== undefined) {
        query = query.eq('is_active', active);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RateCard[];
    },
  });
}

export function useGenerateRateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (awardId: string) => {
      // Fetch award with relations
      const { data: award, error: awardError } = await supabase
        .from('awards')
        .select(`
          *,
          quote:quotes(*),
          lane:rfq_lanes(*),
          carrier:carriers(*)
        `)
        .eq('id', awardId)
        .single();
      
      if (awardError) throw awardError;
      
      // Generate rate card number
      const { data: rcNumber } = await supabase.rpc('generate_rate_card_number');
      
      const lane = award.lane as RfqLane;
      const quote = award.quote as Quote;
      
      const { data, error } = await supabase
        .from('rate_cards')
        .insert({
          rate_card_number: rcNumber as string,
          rfq_id: award.rfq_id,
          award_id: award.id,
          carrier_id: award.carrier_id,
          lane_id: award.lane_id,
          origin: `${lane.origin_city}, ${lane.origin_country}`,
          destination: `${lane.destination_city}, ${lane.destination_country}`,
          mode: 'ocean_fcl',
          equipment_type: lane.equipment_type,
          base_rate: award.awarded_rate,
          currency: award.currency,
          rate_unit: quote.rate_unit,
          surcharges: quote.surcharges as any || [],
          total_rate: quote.total_landed_cost,
          valid_from: quote.validity_start || new Date().toISOString().split('T')[0],
          valid_to: quote.validity_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards'] });
      toast.success('Rate card generated');
    },
    onError: (error) => {
      toast.error('Failed to generate rate card: ' + error.message);
    },
  });
}

// Stats
export function useProcurementStats() {
  return useQuery({
    queryKey: ['procurement-stats'],
    queryFn: async () => {
      const [rfqsResult, quotesResult, awardsResult, carriersResult] = await Promise.all([
        supabase.from('rfqs').select('id, status'),
        supabase.from('quotes').select('id, status'),
        supabase.from('awards').select('id'),
        supabase.from('carriers').select('id').eq('is_active', true),
      ]);
      
      const activeRfqs = (rfqsResult.data || []).filter(r => 
        ['published', 'bidding', 'evaluation'].includes(r.status)
      ).length;
      
      const pendingQuotes = (quotesResult.data || []).filter(q => 
        q.status === 'submitted'
      ).length;
      
      return {
        activeRfqs,
        pendingQuotes,
        awardedLanes: awardsResult.data?.length || 0,
        activeCarriers: carriersResult.data?.length || 0,
        avgSavingsPercent: 8.5, // Mock for now
      } as ProcurementStats;
    },
  });
}
