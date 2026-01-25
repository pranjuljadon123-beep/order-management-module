-- =====================================================
-- DOCUMENT MANAGEMENT & INTELLIGENCE MODULE
-- Separate from OMS, event-driven, AI-ready
-- =====================================================

-- Document status enum for workflow
CREATE TYPE public.document_status AS ENUM (
  'draft',
  'pending_review',
  'reviewed',
  'approved',
  'submitted',
  'rejected'
);

-- Document type enum for categorization
CREATE TYPE public.document_type AS ENUM (
  'commercial_invoice',
  'packing_list',
  'bill_of_lading',
  'airway_bill',
  'shipping_instructions',
  'certificate_of_origin',
  'insurance_certificate',
  'proof_of_delivery',
  'customs_declaration',
  'inspection_certificate',
  'other'
);

-- Main documents table (standalone, can link to orders/shipments)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT NOT NULL UNIQUE,
  document_type public.document_type NOT NULL,
  document_name TEXT NOT NULL,
  
  -- Flexible linking (not hard dependency)
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  shipment_id TEXT,
  
  -- Status & workflow
  status public.document_status NOT NULL DEFAULT 'draft',
  
  -- File info
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Content (for generated docs)
  content_data JSONB DEFAULT '{}'::jsonb,
  template_id TEXT,
  
  -- Validation
  validation_status TEXT DEFAULT 'pending',
  validation_errors JSONB DEFAULT '[]'::jsonb,
  validation_warnings JSONB DEFAULT '[]'::jsonb,
  risk_score INTEGER DEFAULT 0,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  parent_document_id UUID REFERENCES public.documents(id),
  
  -- Audit
  created_by UUID,
  uploaded_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  submitted_by UUID,
  submitted_at TIMESTAMPTZ,
  
  -- Metadata
  incoterms TEXT,
  country_of_origin TEXT,
  destination_country TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document versions for full history
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  content_data JSONB NOT NULL,
  file_url TEXT,
  changed_by UUID,
  change_reason TEXT,
  changes_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document comments for collaboration
CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.document_comments(id),
  user_id UUID,
  user_name TEXT,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document validation rules (configurable)
CREATE TABLE public.document_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type public.document_type NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'required_field', 'cross_check', 'format', 'incoterm_specific'
  rule_config JSONB NOT NULL,
  severity TEXT NOT NULL DEFAULT 'error', -- 'error', 'warning', 'info'
  is_active BOOLEAN DEFAULT true,
  applies_to_countries TEXT[],
  applies_to_incoterms TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document events for pub/sub architecture
CREATE TABLE public.document_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  triggered_by UUID,
  triggered_by_system TEXT,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document templates for auto-generation
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type public.document_type NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB NOT NULL,
  country_code TEXT,
  incoterms TEXT[],
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for MVP, tighten in production)
CREATE POLICY "Allow all access to documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow all access to document_versions" ON public.document_versions FOR ALL USING (true);
CREATE POLICY "Allow all access to document_comments" ON public.document_comments FOR ALL USING (true);
CREATE POLICY "Allow read document_validation_rules" ON public.document_validation_rules FOR SELECT USING (true);
CREATE POLICY "Allow all access to document_events" ON public.document_events FOR ALL USING (true);
CREATE POLICY "Allow all access to document_templates" ON public.document_templates FOR ALL USING (true);

-- Generate document number function
CREATE OR REPLACE FUNCTION public.generate_document_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(document_number FROM 10) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM public.documents
  WHERE document_number LIKE 'DOC-' || v_year || '-%';
  
  RETURN 'DOC-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$;

-- Trigger to auto-generate document number
CREATE OR REPLACE FUNCTION public.set_document_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.document_number IS NULL OR NEW.document_number = '' THEN
    NEW.document_number := generate_document_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_document_number_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_document_number();

-- Document event trigger (pub/sub)
CREATE OR REPLACE FUNCTION public.document_event_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.document_events (document_id, event_type, event_data, triggered_by_system)
    VALUES (NEW.id, 'DOCUMENT_CREATED', to_jsonb(NEW), 'system');
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO public.document_events (document_id, event_type, event_data, triggered_by_system)
      VALUES (NEW.id, 'DOCUMENT_STATUS_CHANGED', jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'document_id', NEW.id
      ), 'system');
    END IF;
    
    IF NEW.version > OLD.version THEN
      INSERT INTO public.document_events (document_id, event_type, event_data, triggered_by_system)
      VALUES (NEW.id, 'DOCUMENT_VERSION_CREATED', jsonb_build_object(
        'version', NEW.version,
        'document_id', NEW.id
      ), 'system');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_events_trigger
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.document_event_trigger();

-- Updated_at trigger for documents
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default validation rules
INSERT INTO public.document_validation_rules (document_type, rule_name, rule_type, rule_config, severity) VALUES
('commercial_invoice', 'Invoice number required', 'required_field', '{"field": "invoice_number"}', 'error'),
('commercial_invoice', 'Total value required', 'required_field', '{"field": "total_value"}', 'error'),
('commercial_invoice', 'Currency required', 'required_field', '{"field": "currency"}', 'error'),
('commercial_invoice', 'HS codes required for customs', 'required_field', '{"field": "hs_codes"}', 'warning'),
('bill_of_lading', 'BL number required', 'required_field', '{"field": "bl_number"}', 'error'),
('bill_of_lading', 'Shipper info required', 'required_field', '{"field": "shipper"}', 'error'),
('bill_of_lading', 'Consignee info required', 'required_field', '{"field": "consignee"}', 'error'),
('packing_list', 'Total packages required', 'required_field', '{"field": "total_packages"}', 'error'),
('packing_list', 'Gross weight required', 'required_field', '{"field": "gross_weight"}', 'error'),
('certificate_of_origin', 'Country of origin required', 'required_field', '{"field": "country_of_origin"}', 'error'),
('proof_of_delivery', 'Signature required', 'required_field', '{"field": "signature"}', 'error'),
('proof_of_delivery', 'Delivery date required', 'required_field', '{"field": "delivery_date"}', 'error');

-- Insert default document templates
INSERT INTO public.document_templates (document_type, template_name, template_data, is_default) VALUES
('commercial_invoice', 'Standard Commercial Invoice', '{"sections": ["header", "parties", "items", "totals", "terms"]}', true),
('packing_list', 'Standard Packing List', '{"sections": ["header", "parties", "packages", "totals"]}', true),
('bill_of_lading', 'Ocean Bill of Lading', '{"sections": ["header", "parties", "cargo", "terms", "signatures"]}', true),
('airway_bill', 'Air Waybill', '{"sections": ["header", "parties", "cargo", "charges", "signatures"]}', true),
('certificate_of_origin', 'Generic COO', '{"sections": ["header", "exporter", "goods", "certification"]}', true);

-- Create indexes for performance
CREATE INDEX idx_documents_order_id ON public.documents(order_id);
CREATE INDEX idx_documents_shipment_id ON public.documents(shipment_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_document_events_document_id ON public.document_events(document_id);
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);