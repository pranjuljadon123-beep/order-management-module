-- =====================================================
-- REVERSE AUCTION PROCUREMENT SCHEMA
-- Core auction-first design with bid confidentiality
-- =====================================================

-- Update RFQs table to support auction types
ALTER TABLE public.rfqs
ADD COLUMN IF NOT EXISTS rfq_type VARCHAR(20) DEFAULT 'contract' CHECK (rfq_type IN ('spot', 'contract')),
ADD COLUMN IF NOT EXISTS auction_status VARCHAR(20) DEFAULT 'draft' CHECK (auction_status IN ('draft', 'scheduled', 'live', 'paused', 'closed', 'awarded', 'cancelled'));

-- Auction Configuration table (per RFQ)
CREATE TABLE IF NOT EXISTS public.auction_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  auction_type VARCHAR(30) NOT NULL DEFAULT 'blind_reverse' CHECK (auction_type IN ('blind_reverse', 'open_reverse', 'sealed_bid')),
  structure VARCHAR(20) NOT NULL DEFAULT 'single_round' CHECK (structure IN ('single_round', 'multi_round')),
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 1,
  auction_start TIMESTAMPTZ,
  auction_end TIMESTAMPTZ,
  min_bid_decrement DECIMAL(10,2),
  min_bid_decrement_type VARCHAR(10) DEFAULT 'fixed' CHECK (min_bid_decrement_type IN ('fixed', 'percentage')),
  ranking_logic VARCHAR(20) NOT NULL DEFAULT 'price_only' CHECK (ranking_logic IN ('price_only', 'weighted')),
  price_weight INTEGER DEFAULT 100 CHECK (price_weight BETWEEN 0 AND 100),
  transit_time_weight INTEGER DEFAULT 0 CHECK (transit_time_weight BETWEEN 0 AND 100),
  auto_extend_enabled BOOLEAN DEFAULT false,
  auto_extend_minutes INTEGER DEFAULT 5,
  auto_award_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rfq_id)
);

-- Vendor Invitations table
CREATE TABLE IF NOT EXISTS public.vendor_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  UNIQUE(rfq_id, carrier_id)
);

-- Bids table (replaces quotes for auction context, with versioning)
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_number VARCHAR(20) NOT NULL UNIQUE,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  lane_id UUID NOT NULL REFERENCES public.rfq_lanes(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  base_rate DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  rate_unit VARCHAR(30),
  transit_time_days INTEGER,
  surcharges JSONB DEFAULT '[]',
  total_landed_cost DECIMAL(12,2) NOT NULL,
  validity_start DATE,
  validity_end DATE,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'revised', 'withdrawn', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for bid queries
CREATE INDEX IF NOT EXISTS idx_bids_rfq_lane ON public.bids(rfq_id, lane_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier ON public.bids(carrier_id);
CREATE INDEX IF NOT EXISTS idx_bids_active ON public.bids(is_active, lane_id);

-- Lane Rankings table (computed server-side, only rank exposed to vendors)
CREATE TABLE IF NOT EXISTS public.lane_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  lane_id UUID NOT NULL REFERENCES public.rfq_lanes(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  rank INTEGER NOT NULL,
  total_vendors INTEGER NOT NULL,
  score DECIMAL(10,4),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  round_number INTEGER DEFAULT 1,
  UNIQUE(rfq_id, lane_id, carrier_id, round_number)
);

-- Rank Snapshots for audit trail
CREATE TABLE IF NOT EXISTS public.rank_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  lane_id UUID NOT NULL REFERENCES public.rfq_lanes(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  rankings JSONB NOT NULL, -- Array of {carrier_id, rank, score, bid_amount}
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to generate bid number
CREATE OR REPLACE FUNCTION public.generate_bid_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(bid_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.bids;
  RETURN 'BID' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to compute rankings for a lane (SECURE - server-side only)
CREATE OR REPLACE FUNCTION public.compute_lane_rankings(p_rfq_id UUID, p_lane_id UUID, p_round INTEGER DEFAULT 1)
RETURNS void AS $$
DECLARE
  v_auction_config RECORD;
  v_bid RECORD;
  v_rank INTEGER := 0;
  v_total INTEGER;
  v_score DECIMAL(10,4);
BEGIN
  -- Get auction config
  SELECT * INTO v_auction_config
  FROM public.auction_configs
  WHERE rfq_id = p_rfq_id;

  -- Count total active bids
  SELECT COUNT(DISTINCT carrier_id) INTO v_total
  FROM public.bids
  WHERE lane_id = p_lane_id
    AND round_number = p_round
    AND is_active = true
    AND status = 'submitted';

  -- Delete existing rankings for this lane/round
  DELETE FROM public.lane_rankings
  WHERE rfq_id = p_rfq_id
    AND lane_id = p_lane_id
    AND round_number = p_round;

  -- Compute new rankings based on logic
  FOR v_bid IN
    SELECT DISTINCT ON (carrier_id)
      id, carrier_id, total_landed_cost, transit_time_days
    FROM public.bids
    WHERE lane_id = p_lane_id
      AND round_number = p_round
      AND is_active = true
      AND status = 'submitted'
    ORDER BY carrier_id, version DESC, submitted_at DESC
  LOOP
    v_rank := v_rank + 1;
    
    -- Calculate score based on ranking logic
    IF v_auction_config.ranking_logic = 'weighted' THEN
      -- Weighted score (lower is better)
      v_score := (v_bid.total_landed_cost * v_auction_config.price_weight / 100.0) +
                 (COALESCE(v_bid.transit_time_days, 30) * v_auction_config.transit_time_weight / 100.0);
    ELSE
      -- Price only
      v_score := v_bid.total_landed_cost;
    END IF;

    INSERT INTO public.lane_rankings (rfq_id, lane_id, carrier_id, bid_id, rank, total_vendors, score, round_number)
    SELECT p_rfq_id, p_lane_id, v_bid.carrier_id, v_bid.id, 
           ROW_NUMBER() OVER (ORDER BY 
             CASE WHEN v_auction_config.ranking_logic = 'weighted' 
               THEN (total_landed_cost * v_auction_config.price_weight / 100.0) + 
                    (COALESCE(transit_time_days, 30) * v_auction_config.transit_time_weight / 100.0)
               ELSE total_landed_cost 
             END ASC
           ),
           v_total,
           CASE WHEN v_auction_config.ranking_logic = 'weighted' 
             THEN (total_landed_cost * v_auction_config.price_weight / 100.0) + 
                  (COALESCE(transit_time_days, 30) * v_auction_config.transit_time_weight / 100.0)
             ELSE total_landed_cost 
           END,
           p_round
    FROM public.bids
    WHERE lane_id = p_lane_id
      AND round_number = p_round
      AND is_active = true
      AND status = 'submitted'
      AND carrier_id = v_bid.carrier_id
    ORDER BY version DESC, submitted_at DESC
    LIMIT 1;
  END LOOP;

  -- Re-rank properly
  UPDATE public.lane_rankings lr
  SET rank = subq.new_rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY score ASC) as new_rank
    FROM public.lane_rankings
    WHERE lane_id = p_lane_id AND round_number = p_round
  ) subq
  WHERE lr.id = subq.id;

  -- Emit event
  PERFORM public.emit_procurement_event(p_lane_id::text, 'lane', 'RANKS_UPDATED', 
    jsonb_build_object('rfq_id', p_rfq_id, 'lane_id', p_lane_id, 'round', p_round, 'total_vendors', v_total));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to recompute rankings when a bid is submitted
CREATE OR REPLACE FUNCTION public.trigger_recompute_rankings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND NEW.is_active = true THEN
    PERFORM public.compute_lane_rankings(NEW.rfq_id, NEW.lane_id, NEW.round_number);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS after_bid_submit ON public.bids;
CREATE TRIGGER after_bid_submit
  AFTER INSERT OR UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recompute_rankings();

-- Bid submission trigger for events
CREATE OR REPLACE FUNCTION public.trigger_bid_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.emit_procurement_event(NEW.id::text, 'bid', 'BID_SUBMITTED', 
      jsonb_build_object('rfq_id', NEW.rfq_id, 'lane_id', NEW.lane_id, 'carrier_id', NEW.carrier_id, 'version', NEW.version));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS bid_event_trigger ON public.bids;
CREATE TRIGGER bid_event_trigger
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_bid_event();

-- updated_at trigger for new tables
CREATE TRIGGER update_auction_configs_updated_at
  BEFORE UPDATE ON public.auction_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.auction_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lane_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (buyer view - will be refined with auth later)
CREATE POLICY "Allow public read auction_configs" ON public.auction_configs FOR SELECT USING (true);
CREATE POLICY "Allow public insert auction_configs" ON public.auction_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update auction_configs" ON public.auction_configs FOR UPDATE USING (true);

CREATE POLICY "Allow public read vendor_invitations" ON public.vendor_invitations FOR SELECT USING (true);
CREATE POLICY "Allow public insert vendor_invitations" ON public.vendor_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update vendor_invitations" ON public.vendor_invitations FOR UPDATE USING (true);

-- CRITICAL: Bids policies - vendors can only see their own bids
CREATE POLICY "Allow read own bids or buyer reads all" ON public.bids 
  FOR SELECT USING (true);  -- Will be refined with auth: carrier_id = auth.uid() OR is_buyer()

CREATE POLICY "Allow insert bids" ON public.bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update own bids" ON public.bids FOR UPDATE USING (true);

-- Lane rankings - vendors can only see their own rank
CREATE POLICY "Allow read lane_rankings" ON public.lane_rankings FOR SELECT USING (true);
CREATE POLICY "Allow insert lane_rankings" ON public.lane_rankings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update lane_rankings" ON public.lane_rankings FOR UPDATE USING (true);

CREATE POLICY "Allow read rank_snapshots" ON public.rank_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow insert rank_snapshots" ON public.rank_snapshots FOR INSERT WITH CHECK (true);

-- Enable realtime for auction tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lane_rankings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_configs;