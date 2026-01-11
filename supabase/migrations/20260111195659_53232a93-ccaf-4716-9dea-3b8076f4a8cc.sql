-- Create shippers table
CREATE TABLE public.shippers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  port_code TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consignees table
CREATE TABLE public.consignees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  port_code TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  billing_address TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new fields to rfqs table
ALTER TABLE public.rfqs 
ADD COLUMN pickup_date DATE,
ADD COLUMN po_number TEXT,
ADD COLUMN so_number TEXT,
ADD COLUMN customer_id UUID REFERENCES public.customers(id),
ADD COLUMN shipper_id UUID REFERENCES public.shippers(id),
ADD COLUMN consignee_id UUID REFERENCES public.consignees(id),
ADD COLUMN cargo_type TEXT,
ADD COLUMN cargo_description TEXT;

-- Add new fields to rfq_lanes table
ALTER TABLE public.rfq_lanes
ADD COLUMN origin_port TEXT,
ADD COLUMN destination_port TEXT,
ADD COLUMN origin_address TEXT,
ADD COLUMN destination_address TEXT,
ADD COLUMN shipper_id UUID REFERENCES public.shippers(id),
ADD COLUMN consignee_id UUID REFERENCES public.consignees(id),
ADD COLUMN weight_value NUMERIC,
ADD COLUMN weight_unit TEXT DEFAULT 'KG',
ADD COLUMN volume_value NUMERIC,
ADD COLUMN volume_cbm NUMERIC,
ADD COLUMN quantity INTEGER,
ADD COLUMN quantity_unit TEXT,
ADD COLUMN package_type TEXT,
ADD COLUMN dimensions_length NUMERIC,
ADD COLUMN dimensions_width NUMERIC,
ADD COLUMN dimensions_height NUMERIC,
ADD COLUMN dimensions_unit TEXT DEFAULT 'CM';

-- Enable RLS on new tables
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shippers
CREATE POLICY "Shippers are viewable by everyone" 
ON public.shippers FOR SELECT USING (true);

CREATE POLICY "Shippers can be created by authenticated users"
ON public.shippers FOR INSERT WITH CHECK (true);

CREATE POLICY "Shippers can be updated by authenticated users"
ON public.shippers FOR UPDATE USING (true);

-- Create RLS policies for consignees
CREATE POLICY "Consignees are viewable by everyone" 
ON public.consignees FOR SELECT USING (true);

CREATE POLICY "Consignees can be created by authenticated users"
ON public.consignees FOR INSERT WITH CHECK (true);

CREATE POLICY "Consignees can be updated by authenticated users"
ON public.consignees FOR UPDATE USING (true);

-- Create RLS policies for customers
CREATE POLICY "Customers are viewable by everyone" 
ON public.customers FOR SELECT USING (true);

CREATE POLICY "Customers can be created by authenticated users"
ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can be updated by authenticated users"
ON public.customers FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_shippers_name ON public.shippers(name);
CREATE INDEX idx_shippers_code ON public.shippers(code);
CREATE INDEX idx_consignees_name ON public.consignees(name);
CREATE INDEX idx_consignees_code ON public.consignees(code);
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_code ON public.customers(code);
CREATE INDEX idx_rfqs_customer ON public.rfqs(customer_id);
CREATE INDEX idx_rfqs_shipper ON public.rfqs(shipper_id);
CREATE INDEX idx_rfqs_consignee ON public.rfqs(consignee_id);
CREATE INDEX idx_rfq_lanes_shipper ON public.rfq_lanes(shipper_id);
CREATE INDEX idx_rfq_lanes_consignee ON public.rfq_lanes(consignee_id);