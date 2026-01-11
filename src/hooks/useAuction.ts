import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type {
  AuctionRfq,
  AuctionConfig,
  Bid,
  LaneRanking,
  VendorInvitation,
  CreateAuctionRfqInput,
  SubmitBidInput,
  AuctionStats,
  AuctionStatus,
} from '@/types/auction';

// ==================== QUERIES ====================

// Fetch all RFQs with auction data
export function useAuctionRfqs(auctionStatus?: AuctionStatus) {
  return useQuery({
    queryKey: ['auction-rfqs', auctionStatus],
    queryFn: async () => {
      let query = supabase
        .from('rfqs')
        .select(`
          *,
          lanes:rfq_lanes(*),
          auction_config:auction_configs(*),
          bids(*),
          vendor_invitations(*)
        `)
        .order('created_at', { ascending: false });

      if (auctionStatus) {
        query = query.eq('auction_status', auctionStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AuctionRfq[];
    },
  });
}

// Fetch single RFQ with full auction details (for buyer)
export function useAuctionRfq(id: string) {
  return useQuery({
    queryKey: ['auction-rfq', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          lanes:rfq_lanes(*),
          auction_config:auction_configs(*),
          bids(*, carrier:carriers(*)),
          vendor_invitations(*, carrier:carriers(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as AuctionRfq;
    },
    enabled: !!id,
  });
}

// Fetch bids for a specific lane (buyer view - sees all)
export function useLaneBids(laneId: string, roundNumber: number = 1) {
  return useQuery({
    queryKey: ['lane-bids', laneId, roundNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          carrier:carriers(*)
        `)
        .eq('lane_id', laneId)
        .eq('round_number', roundNumber)
        .eq('is_active', true)
        .eq('status', 'submitted')
        .order('total_landed_cost', { ascending: true });

      if (error) throw error;
      return data as unknown as Bid[];
    },
    enabled: !!laneId,
  });
}

// Fetch rankings for a lane (buyer view - sees all ranks)
export function useLaneRankings(laneId: string, roundNumber: number = 1) {
  return useQuery({
    queryKey: ['lane-rankings', laneId, roundNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lane_rankings')
        .select(`
          *,
          carrier:carriers(*),
          bid:bids(*)
        `)
        .eq('lane_id', laneId)
        .eq('round_number', roundNumber)
        .order('rank', { ascending: true });

      if (error) throw error;
      return data as unknown as (LaneRanking & { carrier: any; bid: Bid })[];
    },
    enabled: !!laneId,
  });
}

// Fetch vendor's own ranking (vendor view - only sees own rank)
export function useVendorRanking(laneId: string, carrierId: string, roundNumber: number = 1) {
  return useQuery({
    queryKey: ['vendor-ranking', laneId, carrierId, roundNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lane_rankings')
        .select('rank, total_vendors, computed_at')
        .eq('lane_id', laneId)
        .eq('carrier_id', carrierId)
        .eq('round_number', roundNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as { rank: number; total_vendors: number; computed_at: string } | null;
    },
    enabled: !!laneId && !!carrierId,
  });
}

// Fetch vendor's own bids (vendor view - confidential)
export function useVendorBids(rfqId: string, carrierId: string) {
  return useQuery({
    queryKey: ['vendor-bids', rfqId, carrierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          lane:rfq_lanes(*)
        `)
        .eq('rfq_id', rfqId)
        .eq('carrier_id', carrierId)
        .eq('is_active', true)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Bid[];
    },
    enabled: !!rfqId && !!carrierId,
  });
}

// Auction stats
export function useAuctionStats() {
  return useQuery({
    queryKey: ['auction-stats'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [liveResult, scheduledResult, closedResult, bidsResult] = await Promise.all([
        supabase.from('rfqs').select('id').eq('auction_status', 'live'),
        supabase.from('rfqs').select('id').eq('auction_status', 'scheduled'),
        supabase.from('rfqs').select('id').eq('auction_status', 'closed'),
        supabase.from('bids').select('id, rfq_id').gte('submitted_at', todayStart.toISOString()),
      ]);

      const totalBidsToday = bidsResult.data?.length || 0;
      const uniqueRfqs = new Set(bidsResult.data?.map(b => b.rfq_id) || []).size;

      return {
        liveAuctions: liveResult.data?.length || 0,
        scheduledAuctions: scheduledResult.data?.length || 0,
        pendingAwards: closedResult.data?.length || 0,
        totalBidsToday,
        avgBidsPerAuction: uniqueRfqs > 0 ? Math.round(totalBidsToday / uniqueRfqs) : 0,
      } as AuctionStats;
    },
  });
}

// ==================== MUTATIONS ====================

// Create auction RFQ with config and lanes
export function useCreateAuctionRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAuctionRfqInput) => {
      // Generate RFQ number
      const { data: rfqNumber } = await supabase.rpc('generate_rfq_number');

      // Create RFQ
      const { data: rfq, error: rfqError } = await supabase
        .from('rfqs')
        .insert({
          rfq_number: rfqNumber,
          title: input.title,
          mode: input.mode,
          rfq_type: input.rfq_type,
          auction_status: 'draft',
          status: 'draft',
          incoterms: input.incoterms,
          contract_duration_months: input.contract_duration_months,
          estimated_annual_volume: input.estimated_annual_volume,
          notes: input.notes,
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

        const { error: lanesError } = await supabase.from('rfq_lanes').insert(lanes);
        if (lanesError) throw lanesError;
      }

      // Create auction config
      const { error: configError } = await supabase.from('auction_configs').insert({
        rfq_id: rfq.id,
        auction_type: input.auction_config.auction_type,
        structure: input.auction_config.structure,
        max_rounds: input.auction_config.max_rounds || 1,
        auction_start: input.auction_config.auction_start,
        auction_end: input.auction_config.auction_end,
        min_bid_decrement: input.auction_config.min_bid_decrement,
        min_bid_decrement_type: input.auction_config.min_bid_decrement_type || 'fixed',
        ranking_logic: input.auction_config.ranking_logic,
        price_weight: input.auction_config.price_weight || 100,
        transit_time_weight: input.auction_config.transit_time_weight || 0,
        auto_extend_enabled: input.auction_config.auto_extend_enabled || false,
        auto_extend_minutes: input.auction_config.auto_extend_minutes || 5,
        auto_award_enabled: input.auction_config.auto_award_enabled || false,
      });

      if (configError) throw configError;

      // Create vendor invitations
      if (input.invited_vendors.length > 0) {
        const invitations = input.invited_vendors.map((carrierId) => ({
          rfq_id: rfq.id,
          carrier_id: carrierId,
        }));

        const { error: invError } = await supabase.from('vendor_invitations').insert(invitations);
        if (invError) throw invError;
      }

      return rfq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auction-rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['auction-stats'] });
      toast.success('Auction RFQ created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create RFQ: ' + error.message);
    },
  });
}

// Update auction status (start, pause, close)
export function useUpdateAuctionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rfqId, status }: { rfqId: string; status: AuctionStatus }) => {
      const { data, error } = await supabase
        .from('rfqs')
        .update({ auction_status: status })
        .eq('id', rfqId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction-rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['auction-rfq', variables.rfqId] });
      queryClient.invalidateQueries({ queryKey: ['auction-stats'] });
      toast.success(`Auction ${variables.status}`);
    },
    onError: (error) => {
      toast.error('Failed to update auction: ' + error.message);
    },
  });
}

// Submit bid (vendor)
export function useSubmitBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitBidInput) => {
      // Generate bid number
      const { data: bidNumber } = await supabase.rpc('generate_bid_number');

      // Get current version for this carrier/lane
      const { data: existingBids } = await supabase
        .from('bids')
        .select('version')
        .eq('rfq_id', input.rfq_id)
        .eq('lane_id', input.lane_id)
        .eq('carrier_id', input.carrier_id)
        .order('version', { ascending: false })
        .limit(1);

      const newVersion = (existingBids?.[0]?.version || 0) + 1;

      // Mark old bids as inactive
      if (newVersion > 1) {
        await supabase
          .from('bids')
          .update({ is_active: false, status: 'revised' })
          .eq('rfq_id', input.rfq_id)
          .eq('lane_id', input.lane_id)
          .eq('carrier_id', input.carrier_id);
      }

      // Calculate total landed cost
      const surchargesTotal = (input.surcharges || []).reduce((sum, s) => {
        return sum + (s.type === 'fixed' ? s.amount : input.base_rate * (s.amount / 100));
      }, 0);
      const totalLandedCost = input.base_rate + surchargesTotal;

      // Create new bid
      const { data, error } = await supabase
        .from('bids')
        .insert({
          bid_number: bidNumber as string,
          rfq_id: input.rfq_id,
          lane_id: input.lane_id,
          carrier_id: input.carrier_id,
          version: newVersion,
          base_rate: input.base_rate,
          currency: input.currency || 'USD',
          rate_unit: input.rate_unit,
          transit_time_days: input.transit_time_days,
          surcharges: input.surcharges || [],
          total_landed_cost: totalLandedCost,
          validity_start: input.validity_start,
          validity_end: input.validity_end,
          notes: input.notes,
          status: 'submitted',
          is_active: true,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lane-bids', variables.lane_id] });
      queryClient.invalidateQueries({ queryKey: ['lane-rankings', variables.lane_id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bids', variables.rfq_id, variables.carrier_id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-ranking', variables.lane_id, variables.carrier_id] });
      toast.success('Bid submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit bid: ' + error.message);
    },
  });
}

// Award lane to winner
export function useAwardLane() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rfqId,
      laneId,
      bidId,
      carrierId,
      awardedRate,
      rationale,
    }: {
      rfqId: string;
      laneId: string;
      bidId: string;
      carrierId: string;
      awardedRate: number;
      rationale?: string;
    }) => {
      const { data: awardNumber } = await supabase.rpc('generate_award_number');

      const { data: award, error: awardError } = await supabase
        .from('awards')
        .insert({
          award_number: awardNumber,
          rfq_id: rfqId,
          lane_id: laneId,
          quote_id: bidId, // Using quote_id for bid reference
          carrier_id: carrierId,
          awarded_rate: awardedRate,
          rationale,
          status: 'active',
        })
        .select()
        .single();

      if (awardError) throw awardError;

      // Update bid status
      await supabase.from('bids').update({ status: 'accepted' }).eq('id', bidId);

      // Update lane as awarded
      await supabase.from('rfq_lanes').update({ is_awarded: true }).eq('id', laneId);

      return award;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction-rfq', variables.rfqId] });
      queryClient.invalidateQueries({ queryKey: ['lane-bids', variables.laneId] });
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      toast.success('Lane awarded successfully');
    },
    onError: (error) => {
      toast.error('Failed to award lane: ' + error.message);
    },
  });
}

// ==================== REALTIME ====================

// Subscribe to bid updates for a lane (buyer)
export function useLaneBidsRealtime(laneId: string, onUpdate: () => void) {
  useEffect(() => {
    if (!laneId) return;

    const channel = supabase
      .channel(`bids-${laneId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `lane_id=eq.${laneId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [laneId, onUpdate]);
}

// Subscribe to ranking updates (vendor - sees own rank change)
export function useRankingRealtime(laneId: string, carrierId: string, onUpdate: () => void) {
  useEffect(() => {
    if (!laneId || !carrierId) return;

    const channel = supabase
      .channel(`rankings-${laneId}-${carrierId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lane_rankings',
          filter: `lane_id=eq.${laneId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [laneId, carrierId, onUpdate]);
}
