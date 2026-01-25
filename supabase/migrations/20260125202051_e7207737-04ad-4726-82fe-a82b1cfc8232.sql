-- Create order type enum
CREATE TYPE public.order_type AS ENUM ('purchase_order', 'sales_order', 'transport_order');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM (
  'created',
  'confirmed', 
  'ready_to_ship',
  'booked',
  'in_transit',
  'delivered',
  'closed',
  'cancelled'
);

-- Create order risk level enum
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  order_type order_type NOT NULL DEFAULT 'transport_order',
  status order_status NOT NULL DEFAULT 'created',
  
  -- Customer & References
  customer_id UUID REFERENCES public.customers(id),
  shipper_id UUID REFERENCES public.shippers(id),
  consignee_id UUID REFERENCES public.consignees(id),
  po_number TEXT,
  so_number TEXT,
  customer_reference TEXT,
  internal_reference TEXT,
  
  -- Commodity details
  commodity_description TEXT,
  sku_code TEXT,
  hs_code TEXT,
  
  -- Quantities
  quantity INTEGER,
  quantity_unit TEXT DEFAULT 'PCS',
  weight_value NUMERIC,
  weight_unit TEXT DEFAULT 'KG',
  volume_value NUMERIC,
  volume_unit TEXT DEFAULT 'CBM',
  
  -- Routing
  origin_address TEXT,
  origin_city TEXT,
  origin_country TEXT,
  origin_port_code TEXT,
  destination_address TEXT,
  destination_city TEXT,
  destination_country TEXT,
  destination_port_code TEXT,
  
  -- Logistics terms
  incoterms TEXT,
  mode TEXT,
  service_level TEXT,
  
  -- Dates
  requested_pickup_date DATE,
  requested_delivery_date DATE,
  confirmed_pickup_date DATE,
  confirmed_delivery_date DATE,
  actual_pickup_date DATE,
  actual_delivery_date DATE,
  
  -- AI/Risk
  risk_score INTEGER DEFAULT 0,
  risk_level risk_level DEFAULT 'low',
  risk_factors JSONB DEFAULT '[]'::jsonb,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order versions table for audit history
CREATE TABLE public.order_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  changes JSONB NOT NULL,
  previous_state JSONB NOT NULL,
  new_state JSONB NOT NULL,
  changed_by UUID,
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order state transitions table
CREATE TABLE public.order_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  from_status order_status,
  to_status order_status NOT NULL,
  triggered_by UUID,
  triggered_by_system TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order events table for pub/sub
CREATE TABLE public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order-shipment mapping table (flexible many-to-many)
CREATE TABLE public.order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  shipment_id TEXT NOT NULL,
  
  -- Quantity allocation for partial fulfillment
  allocated_quantity INTEGER,
  allocated_weight NUMERIC,
  allocated_volume NUMERIC,
  
  -- Status rollup
  shipment_status TEXT,
  is_primary BOOLEAN DEFAULT false,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order documents table
CREATE TABLE public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  uploaded_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generate order number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || v_year || '-%';
  
  RETURN 'ORD-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$;

-- Trigger to set order_number on insert
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Trigger to emit order events
CREATE OR REPLACE FUNCTION public.order_event_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_events (order_id, event_type, event_data)
    VALUES (NEW.id, 'ORDER_CREATED', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      -- Record state transition
      INSERT INTO public.order_state_transitions (order_id, from_status, to_status, triggered_by_system)
      VALUES (NEW.id, OLD.status, NEW.status, 'system');
      
      INSERT INTO public.order_events (order_id, event_type, event_data)
      VALUES (NEW.id, 'ORDER_STATUS_CHANGED', jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'order_id', NEW.id
      ));
    END IF;
    
    IF NEW.version > OLD.version THEN
      INSERT INTO public.order_events (order_id, event_type, event_data)
      VALUES (NEW.id, 'ORDER_UPDATED', jsonb_build_object(
        'version', NEW.version,
        'order_id', NEW.id
      ));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_order_events
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.order_event_trigger();

-- Trigger to update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_shipments_updated_at
  BEFORE UPDATE ON public.order_shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_documents_updated_at
  BEFORE UPDATE ON public.order_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_state_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all access to order_versions" ON public.order_versions FOR ALL USING (true);
CREATE POLICY "Allow all access to order_state_transitions" ON public.order_state_transitions FOR ALL USING (true);
CREATE POLICY "Allow all access to order_events" ON public.order_events FOR ALL USING (true);
CREATE POLICY "Allow all access to order_shipments" ON public.order_shipments FOR ALL USING (true);
CREATE POLICY "Allow all access to order_documents" ON public.order_documents FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_type ON public.orders(order_type);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_shipments_order_id ON public.order_shipments(order_id);
CREATE INDEX idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX idx_order_events_processed ON public.order_events(processed) WHERE NOT processed;