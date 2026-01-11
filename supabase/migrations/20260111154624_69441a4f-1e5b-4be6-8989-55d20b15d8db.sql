-- =====================================================
-- FREIGHT PROCUREMENT MODULE - COMPLETE SCHEMA
-- Modular, API-first design for enterprise logistics
-- =====================================================

-- 1. CARRIERS (Reference Table)
-- Independent entity referenced by quotes and awards
CREATE TABLE public.carriers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  supported_modes TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. RFQs (Request for Quotations)
CREATE TABLE public.rfqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('ocean_fcl', 'ocean_lcl', 'air', 'road_ftl', 'road_ltl', 'rail')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'bidding', 'evaluation', 'awarded', 'cancelled', 'expired')),
  incoterms TEXT,
  contract_duration_months INTEGER DEFAULT 12,
  estimated_annual_volume TEXT,
  bid_deadline TIMESTAMP WITH TIME ZONE,
  valid_from DATE,
  valid_to DATE,
  notes TEXT,
  created_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. RFQ LANES (Multiple lanes per RFQ)
CREATE TABLE public.rfq_lanes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  lane_number INTEGER NOT NULL,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_port_code TEXT,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_port_code TEXT,
  equipment_type TEXT,
  estimated_volume TEXT,
  volume_unit TEXT,
  frequency TEXT,
  special_requirements TEXT,
  is_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rfq_id, lane_number)
);

-- 4. QUOTES (Carrier submissions)
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  lane_id UUID NOT NULL REFERENCES public.rfq_lanes(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES public.carriers(id),
  quote_type TEXT DEFAULT 'contract' CHECK (quote_type IN ('spot', 'contract')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'revised', 'withdrawn', 'accepted', 'rejected')),
  version INTEGER DEFAULT 1,
  base_freight_rate DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  rate_unit TEXT,
  transit_time_days INTEGER,
  validity_start DATE,
  validity_end DATE,
  surcharges JSONB DEFAULT '[]',
  total_landed_cost DECIMAL(12,2),
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. QUOTE VERSIONS (Audit trail for quote revisions)
CREATE TABLE public.quote_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  base_freight_rate DECIMAL(12,2) NOT NULL,
  surcharges JSONB DEFAULT '[]',
  total_landed_cost DECIMAL(12,2),
  transit_time_days INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. AWARDS (Lane allocations)
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  award_number TEXT NOT NULL UNIQUE,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id),
  lane_id UUID NOT NULL REFERENCES public.rfq_lanes(id),
  quote_id UUID NOT NULL REFERENCES public.quotes(id),
  carrier_id UUID NOT NULL REFERENCES public.carriers(id),
  award_type TEXT DEFAULT 'full' CHECK (award_type IN ('full', 'split', 'backup')),
  allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  awarded_rate DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  rationale TEXT,
  awarded_by UUID,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_locked BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lane_id, carrier_id, award_type)
);

-- 7. RATE CARDS (Generated from awards)
CREATE TABLE public.rate_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_card_number TEXT NOT NULL UNIQUE,
  rfq_id UUID REFERENCES public.rfqs(id),
  award_id UUID REFERENCES public.awards(id),
  carrier_id UUID NOT NULL REFERENCES public.carriers(id),
  lane_id UUID NOT NULL REFERENCES public.rfq_lanes(id),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  mode TEXT NOT NULL,
  equipment_type TEXT,
  base_rate DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  rate_unit TEXT,
  surcharges JSONB DEFAULT '[]',
  total_rate DECIMAL(12,2),
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. PROCUREMENT EVENTS (For module integration)
CREATE TABLE public.procurement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'RFQ_CREATED', 'RFQ_PUBLISHED', 'RFQ_CLOSED',
    'QUOTE_SUBMITTED', 'QUOTE_REVISED', 'QUOTE_WITHDRAWN',
    'LANE_AWARDED', 'AWARD_LOCKED',
    'RATE_CARD_PUBLISHED', 'RATE_CARD_EXPIRED'
  )),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. BENCHMARK RATES (Historical reference)
CREATE TABLE public.benchmark_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  mode TEXT NOT NULL,
  equipment_type TEXT,
  avg_rate DECIMAL(12,2),
  min_rate DECIMAL(12,2),
  max_rate DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  sample_size INTEGER DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_lanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for MVP, can be restricted later)
CREATE POLICY "Allow all access to carriers" ON public.carriers FOR ALL USING (true);
CREATE POLICY "Allow all access to rfqs" ON public.rfqs FOR ALL USING (true);
CREATE POLICY "Allow all access to rfq_lanes" ON public.rfq_lanes FOR ALL USING (true);
CREATE POLICY "Allow all access to quotes" ON public.quotes FOR ALL USING (true);
CREATE POLICY "Allow all access to quote_versions" ON public.quote_versions FOR ALL USING (true);
CREATE POLICY "Allow all access to awards" ON public.awards FOR ALL USING (true);
CREATE POLICY "Allow all access to rate_cards" ON public.rate_cards FOR ALL USING (true);
CREATE POLICY "Allow all access to procurement_events" ON public.procurement_events FOR ALL USING (true);
CREATE POLICY "Allow all access to benchmark_rates" ON public.benchmark_rates FOR ALL USING (true);

-- Function to emit procurement events
CREATE OR REPLACE FUNCTION public.emit_procurement_event(
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_payload JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.procurement_events (event_type, entity_type, entity_id, payload)
  VALUES (p_event_type, p_entity_type, p_entity_id, p_payload)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to emit RFQ events
CREATE OR REPLACE FUNCTION public.rfq_event_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM emit_procurement_event('RFQ_CREATED', 'rfq', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'published' THEN
      PERFORM emit_procurement_event('RFQ_PUBLISHED', 'rfq', NEW.id, to_jsonb(NEW));
    ELSIF NEW.status = 'awarded' THEN
      PERFORM emit_procurement_event('RFQ_CLOSED', 'rfq', NEW.id, to_jsonb(NEW));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER rfq_event_trigger
AFTER INSERT OR UPDATE ON public.rfqs
FOR EACH ROW EXECUTE FUNCTION public.rfq_event_trigger();

-- Trigger to emit Quote events
CREATE OR REPLACE FUNCTION public.quote_event_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM emit_procurement_event('QUOTE_SUBMITTED', 'quote', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.version > OLD.version THEN
      PERFORM emit_procurement_event('QUOTE_REVISED', 'quote', NEW.id, to_jsonb(NEW));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER quote_event_trigger
AFTER INSERT OR UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.quote_event_trigger();

-- Trigger to emit Award events
CREATE OR REPLACE FUNCTION public.award_event_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM emit_procurement_event('LANE_AWARDED', 'award', NEW.id, to_jsonb(NEW));
    -- Mark lane as awarded
    UPDATE public.rfq_lanes SET is_awarded = true WHERE id = NEW.lane_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.is_locked = true AND OLD.is_locked = false THEN
    PERFORM emit_procurement_event('AWARD_LOCKED', 'award', NEW.id, to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER award_event_trigger
AFTER INSERT OR UPDATE ON public.awards
FOR EACH ROW EXECUTE FUNCTION public.award_event_trigger();

-- Trigger to emit Rate Card events
CREATE OR REPLACE FUNCTION public.rate_card_event_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM emit_procurement_event('RATE_CARD_PUBLISHED', 'rate_card', NEW.id, to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER rate_card_event_trigger
AFTER INSERT ON public.rate_cards
FOR EACH ROW EXECUTE FUNCTION public.rate_card_event_trigger();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_carriers_updated_at BEFORE UPDATE ON public.carriers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_awards_updated_at BEFORE UPDATE ON public.awards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rate_cards_updated_at BEFORE UPDATE ON public.rate_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_benchmark_rates_updated_at BEFORE UPDATE ON public.benchmark_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_rfqs_status ON public.rfqs(status);
CREATE INDEX idx_rfqs_mode ON public.rfqs(mode);
CREATE INDEX idx_rfq_lanes_rfq_id ON public.rfq_lanes(rfq_id);
CREATE INDEX idx_quotes_rfq_id ON public.quotes(rfq_id);
CREATE INDEX idx_quotes_lane_id ON public.quotes(lane_id);
CREATE INDEX idx_quotes_carrier_id ON public.quotes(carrier_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_awards_rfq_id ON public.awards(rfq_id);
CREATE INDEX idx_awards_lane_id ON public.awards(lane_id);
CREATE INDEX idx_rate_cards_carrier_id ON public.rate_cards(carrier_id);
CREATE INDEX idx_rate_cards_active ON public.rate_cards(is_active);
CREATE INDEX idx_procurement_events_type ON public.procurement_events(event_type);
CREATE INDEX idx_procurement_events_processed ON public.procurement_events(processed);

-- Generate unique RFQ number function
CREATE OR REPLACE FUNCTION public.generate_rfq_number() RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(rfq_number FROM 10) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.rfqs
  WHERE rfq_number LIKE 'RFQ-' || v_year || '-%';
  
  RETURN 'RFQ-' || v_year || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Generate unique quote number function
CREATE OR REPLACE FUNCTION public.generate_quote_number() RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 10) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.quotes
  WHERE quote_number LIKE 'QUO-' || v_year || '-%';
  
  RETURN 'QUO-' || v_year || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Generate unique award number function
CREATE OR REPLACE FUNCTION public.generate_award_number() RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(award_number FROM 10) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.awards
  WHERE award_number LIKE 'AWD-' || v_year || '-%';
  
  RETURN 'AWD-' || v_year || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Generate unique rate card number function
CREATE OR REPLACE FUNCTION public.generate_rate_card_number() RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(rate_card_number FROM 9) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.rate_cards
  WHERE rate_card_number LIKE 'RC-' || v_year || '-%';
  
  RETURN 'RC-' || v_year || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Seed sample carriers
INSERT INTO public.carriers (name, code, contact_email, supported_modes, rating, is_active) VALUES
('Maersk Line', 'MAERSK', 'quotes@maersk.com', ARRAY['ocean_fcl', 'ocean_lcl'], 4.5, true),
('MSC Mediterranean Shipping', 'MSC', 'sales@msc.com', ARRAY['ocean_fcl', 'ocean_lcl'], 4.3, true),
('CMA CGM', 'CMACGM', 'freight@cma-cgm.com', ARRAY['ocean_fcl', 'ocean_lcl', 'air'], 4.4, true),
('DHL Global Forwarding', 'DHLGF', 'logistics@dhl.com', ARRAY['air', 'ocean_fcl', 'road_ftl'], 4.6, true),
('FedEx Logistics', 'FEDEX', 'enterprise@fedex.com', ARRAY['air', 'road_ftl', 'road_ltl'], 4.5, true),
('UPS Supply Chain', 'UPS', 'freight@ups.com', ARRAY['air', 'road_ftl', 'road_ltl'], 4.4, true),
('DB Schenker', 'SCHENKER', 'quotes@dbschenker.com', ARRAY['air', 'ocean_fcl', 'rail', 'road_ftl'], 4.2, true),
('Kuehne + Nagel', 'KN', 'sales@kuehne-nagel.com', ARRAY['air', 'ocean_fcl', 'ocean_lcl', 'road_ftl'], 4.7, true);

-- Enable realtime for events (for future webhook/subscription integration)
ALTER PUBLICATION supabase_realtime ADD TABLE public.procurement_events;