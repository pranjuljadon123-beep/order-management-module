
-- Shipment workflow stages enum
CREATE TYPE public.workflow_stage AS ENUM (
  'booking',
  'documentation',
  'customs',
  'loading',
  'in_transit',
  'delivery'
);

-- Shipment workflow owner roles
CREATE TYPE public.workflow_owner_role AS ENUM (
  'operations',
  'documentation_compliance',
  'unassigned'
);

-- Main shipment workflows table
CREATE TABLE public.shipment_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  customer_name TEXT,
  origin_city TEXT,
  origin_country TEXT,
  destination_city TEXT,
  destination_country TEXT,
  mode TEXT DEFAULT 'ocean',
  carrier_name TEXT,
  current_stage workflow_stage NOT NULL DEFAULT 'booking',
  priority TEXT DEFAULT 'normal',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stage assignments and SLA tracking
CREATE TABLE public.workflow_stage_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.shipment_workflows(id) ON DELETE CASCADE,
  stage workflow_stage NOT NULL,
  owner_role workflow_owner_role NOT NULL DEFAULT 'unassigned',
  owner_name TEXT,
  sla_hours INTEGER DEFAULT 24,
  entered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workflow_id, stage)
);

-- Stage activity log
CREATE TABLE public.workflow_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.shipment_workflows(id) ON DELETE CASCADE,
  stage workflow_stage NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipment_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_stage_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies (open for now)
CREATE POLICY "Allow all access to shipment_workflows" ON public.shipment_workflows FOR ALL USING (true);
CREATE POLICY "Allow all access to workflow_stage_assignments" ON public.workflow_stage_assignments FOR ALL USING (true);
CREATE POLICY "Allow all access to workflow_activity_log" ON public.workflow_activity_log FOR ALL USING (true);
