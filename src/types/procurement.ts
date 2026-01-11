// Procurement Module Types - Decoupled for API-first design

export type TransportMode = 'ocean_fcl' | 'ocean_lcl' | 'air' | 'road_ftl' | 'road_ltl' | 'rail';
export type RfqStatus = 'draft' | 'published' | 'bidding' | 'evaluation' | 'awarded' | 'cancelled' | 'expired';
export type QuoteStatus = 'draft' | 'submitted' | 'revised' | 'withdrawn' | 'accepted' | 'rejected';
export type QuoteType = 'spot' | 'contract';
export type AwardType = 'full' | 'split' | 'backup';
export type AwardStatus = 'active' | 'expired' | 'terminated';

export interface Carrier {
  id: string;
  name: string;
  code: string;
  contact_email?: string;
  contact_phone?: string;
  supported_modes: TransportMode[];
  rating: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RfqLane {
  id: string;
  rfq_id: string;
  lane_number: number;
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
  is_awarded: boolean;
  created_at: string;
}

export interface Rfq {
  id: string;
  rfq_number: string;
  title: string;
  mode: TransportMode;
  status: RfqStatus;
  incoterms?: string;
  contract_duration_months?: number;
  estimated_annual_volume?: string;
  bid_deadline?: string;
  valid_from?: string;
  valid_to?: string;
  notes?: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations
  lanes?: RfqLane[];
  quotes?: Quote[];
}

export interface Surcharge {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface Quote {
  id: string;
  quote_number: string;
  rfq_id: string;
  lane_id: string;
  carrier_id: string;
  quote_type: QuoteType;
  status: QuoteStatus;
  version: number;
  base_freight_rate: number;
  currency: string;
  rate_unit?: string;
  transit_time_days?: number;
  validity_start?: string;
  validity_end?: string;
  surcharges: Surcharge[];
  total_landed_cost?: number;
  notes?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  // Relations
  carrier?: Carrier;
  lane?: RfqLane;
}

export interface Award {
  id: string;
  award_number: string;
  rfq_id: string;
  lane_id: string;
  quote_id: string;
  carrier_id: string;
  award_type: AwardType;
  allocation_percentage: number;
  awarded_rate: number;
  currency: string;
  rationale?: string;
  awarded_by?: string;
  awarded_at: string;
  is_locked: boolean;
  status: AwardStatus;
  created_at: string;
  updated_at: string;
  // Relations
  carrier?: Carrier;
  lane?: RfqLane;
  quote?: Quote;
}

export interface RateCard {
  id: string;
  rate_card_number: string;
  rfq_id?: string;
  award_id?: string;
  carrier_id: string;
  lane_id: string;
  origin: string;
  destination: string;
  mode: string;
  equipment_type?: string;
  base_rate: number;
  currency: string;
  rate_unit?: string;
  surcharges: Surcharge[];
  total_rate?: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations
  carrier?: Carrier;
}

export interface ProcurementEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface BenchmarkRate {
  id: string;
  origin: string;
  destination: string;
  mode: string;
  equipment_type?: string;
  avg_rate?: number;
  min_rate?: number;
  max_rate?: number;
  currency: string;
  sample_size: number;
  period_start?: string;
  period_end?: string;
  created_at: string;
  updated_at: string;
}

// Form types for creating/updating
export interface CreateRfqInput {
  title: string;
  mode: TransportMode;
  incoterms?: string;
  contract_duration_months?: number;
  estimated_annual_volume?: string;
  bid_deadline?: string;
  valid_from?: string;
  valid_to?: string;
  notes?: string;
  lanes: CreateLaneInput[];
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

export interface CreateQuoteInput {
  rfq_id: string;
  lane_id: string;
  carrier_id: string;
  quote_type: QuoteType;
  base_freight_rate: number;
  currency?: string;
  rate_unit?: string;
  transit_time_days?: number;
  validity_start?: string;
  validity_end?: string;
  surcharges?: Surcharge[];
  notes?: string;
}

export interface CreateAwardInput {
  rfq_id: string;
  lane_id: string;
  quote_id: string;
  carrier_id: string;
  award_type?: AwardType;
  allocation_percentage?: number;
  awarded_rate: number;
  currency?: string;
  rationale?: string;
}

// API Response types
export interface ProcurementStats {
  activeRfqs: number;
  pendingQuotes: number;
  awardedLanes: number;
  activeCarriers: number;
  avgSavingsPercent: number;
}

export interface QuoteComparison {
  lane: RfqLane;
  quotes: (Quote & { carrier: Carrier; benchmark_delta?: number })[];
  bestQuote?: Quote;
  avgRate: number;
}
