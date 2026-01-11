// Reverse Auction Types - Separate from legacy procurement for clean architecture

export type AuctionType = 'blind_reverse' | 'open_reverse' | 'sealed_bid';
export type AuctionStructure = 'single_round' | 'multi_round';
export type AuctionStatus = 'draft' | 'scheduled' | 'live' | 'paused' | 'closed' | 'awarded' | 'cancelled';
export type RfqType = 'spot' | 'contract';
export type BidStatus = 'draft' | 'submitted' | 'revised' | 'withdrawn' | 'accepted' | 'rejected';
export type RankingLogic = 'price_only' | 'weighted';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface AuctionConfig {
  id: string;
  rfq_id: string;
  auction_type: AuctionType;
  structure: AuctionStructure;
  current_round: number;
  max_rounds: number;
  auction_start?: string;
  auction_end?: string;
  min_bid_decrement?: number;
  min_bid_decrement_type: 'fixed' | 'percentage';
  ranking_logic: RankingLogic;
  price_weight: number;
  transit_time_weight: number;
  auto_extend_enabled: boolean;
  auto_extend_minutes: number;
  auto_award_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorInvitation {
  id: string;
  rfq_id: string;
  carrier_id: string;
  invited_at: string;
  accepted_at?: string;
  declined_at?: string;
  status: InvitationStatus;
}

export interface Bid {
  id: string;
  bid_number: string;
  rfq_id: string;
  lane_id: string;
  carrier_id: string;
  round_number: number;
  version: number;
  base_rate: number;
  currency: string;
  rate_unit?: string;
  transit_time_days?: number;
  surcharges: BidSurcharge[];
  total_landed_cost: number;
  validity_start?: string;
  validity_end?: string;
  notes?: string;
  submitted_at: string;
  is_active: boolean;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  // Relations
  carrier?: import('./procurement').Carrier;
  lane?: import('./procurement').RfqLane;
}

export interface BidSurcharge {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface LaneRanking {
  id: string;
  rfq_id: string;
  lane_id: string;
  carrier_id: string;
  bid_id?: string;
  rank: number;
  total_vendors: number;
  score?: number;
  computed_at: string;
  round_number: number;
}

export interface RankSnapshot {
  id: string;
  rfq_id: string;
  lane_id: string;
  round_number: number;
  rankings: RankingEntry[];
  snapshot_at: string;
}

export interface RankingEntry {
  carrier_id: string;
  rank: number;
  score?: number;
  bid_amount?: number;
}

// Extended RFQ type with auction fields
export interface AuctionRfq {
  id: string;
  rfq_number: string;
  title: string;
  mode: string;
  status: string;
  rfq_type: RfqType;
  auction_status: AuctionStatus;
  incoterms?: string;
  contract_duration_months?: number;
  estimated_annual_volume?: string;
  bid_deadline?: string;
  valid_from?: string;
  valid_to?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  lanes?: import('./procurement').RfqLane[];
  auction_config?: AuctionConfig;
  bids?: Bid[];
  vendor_invitations?: VendorInvitation[];
}

// Form Input Types
export interface CreateAuctionRfqInput {
  title: string;
  mode: string;
  rfq_type: RfqType;
  incoterms?: string;
  contract_duration_months?: number;
  estimated_annual_volume?: string;
  notes?: string;
  lanes: CreateLaneInput[];
  auction_config: CreateAuctionConfigInput;
  invited_vendors: string[]; // carrier_ids
}

export interface CreateLaneInput {
  origin_city: string;
  origin_country: string;
  origin_port_code?: string;
  destination_city: string;
  destination_country: string;
  destination_port_code?: string;
  equipment_type?: string;
  estimated_volume?: string;
  volume_unit?: string;
  frequency?: string;
  special_requirements?: string;
}

export interface CreateAuctionConfigInput {
  auction_type: AuctionType;
  structure: AuctionStructure;
  max_rounds?: number;
  auction_start: string;
  auction_end: string;
  min_bid_decrement?: number;
  min_bid_decrement_type?: 'fixed' | 'percentage';
  ranking_logic: RankingLogic;
  price_weight?: number;
  transit_time_weight?: number;
  auto_extend_enabled?: boolean;
  auto_extend_minutes?: number;
  auto_award_enabled?: boolean;
}

export interface SubmitBidInput {
  rfq_id: string;
  lane_id: string;
  carrier_id: string;
  base_rate: number;
  currency?: string;
  rate_unit?: string;
  transit_time_days?: number;
  surcharges?: BidSurcharge[];
  validity_start?: string;
  validity_end?: string;
  notes?: string;
}

// Vendor-facing types (limited data for confidentiality)
export interface VendorAuctionStatus {
  rfq_id: string;
  rfq_title: string;
  auction_end: string;
  time_remaining_ms: number;
  lanes: VendorLaneStatus[];
}

export interface VendorLaneStatus {
  lane_id: string;
  origin: string;
  destination: string;
  my_rank?: number;
  total_vendors: number;
  my_latest_bid?: number;
  best_rank_achieved?: number;
  can_submit: boolean;
}

// Stats type for auction dashboard
export interface AuctionStats {
  liveAuctions: number;
  scheduledAuctions: number;
  pendingAwards: number;
  totalBidsToday: number;
  avgBidsPerAuction: number;
}
