export type OrderType = 'purchase_order' | 'sales_order' | 'transport_order';

export type OrderStatus = 
  | 'created'
  | 'confirmed'
  | 'ready_to_ship'
  | 'booked'
  | 'in_transit'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Order {
  id: string;
  order_number: string;
  order_type: OrderType;
  status: OrderStatus;
  
  // Customer & References
  customer_id?: string;
  shipper_id?: string;
  consignee_id?: string;
  po_number?: string;
  so_number?: string;
  customer_reference?: string;
  internal_reference?: string;
  
  // Commodity details
  commodity_description?: string;
  sku_code?: string;
  hs_code?: string;
  
  // Quantities
  quantity?: number;
  quantity_unit?: string;
  weight_value?: number;
  weight_unit?: string;
  volume_value?: number;
  volume_unit?: string;
  
  // Routing
  origin_address?: string;
  origin_city?: string;
  origin_country?: string;
  origin_port_code?: string;
  destination_address?: string;
  destination_city?: string;
  destination_country?: string;
  destination_port_code?: string;
  
  // Logistics terms
  incoterms?: string;
  mode?: string;
  service_level?: string;
  
  // Dates
  requested_pickup_date?: string;
  requested_delivery_date?: string;
  confirmed_pickup_date?: string;
  confirmed_delivery_date?: string;
  actual_pickup_date?: string;
  actual_delivery_date?: string;
  
  // AI/Risk
  risk_score?: number;
  risk_level?: RiskLevel;
  risk_factors?: RiskFactor[];
  ai_recommendations?: AiRecommendation[];
  
  // Metadata
  notes?: string;
  metadata?: Record<string, unknown>;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  customer?: { name: string };
  shipper?: { name: string };
  consignee?: { name: string };
}

export interface RiskFactor {
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AiRecommendation {
  type: string;
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

export interface OrderVersion {
  id: string;
  order_id: string;
  version: number;
  changes: Record<string, unknown>;
  previous_state: Record<string, unknown>;
  new_state: Record<string, unknown>;
  changed_by?: string;
  change_reason?: string;
  created_at: string;
}

export interface OrderStateTransition {
  id: string;
  order_id: string;
  from_status?: OrderStatus;
  to_status: OrderStatus;
  triggered_by?: string;
  triggered_by_system?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  processed: boolean;
  processed_at?: string;
  created_at: string;
}

export interface OrderShipment {
  id: string;
  order_id: string;
  shipment_id: string;
  allocated_quantity?: number;
  allocated_weight?: number;
  allocated_volume?: number;
  shipment_status?: string;
  is_primary?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  document_type: string;
  document_name: string;
  file_url?: string;
  status: string;
  version: number;
  uploaded_by?: string;
  approved_by?: string;
  approved_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  created: { label: 'Created', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  confirmed: { label: 'Confirmed', color: 'text-info', bgColor: 'bg-info-light' },
  ready_to_ship: { label: 'Ready to Ship', color: 'text-primary', bgColor: 'bg-accent' },
  booked: { label: 'Booked', color: 'text-ocean', bgColor: 'bg-ocean-light' },
  in_transit: { label: 'In Transit', color: 'text-warning', bgColor: 'bg-warning-light' },
  delivered: { label: 'Delivered', color: 'text-success', bgColor: 'bg-success-light' },
  closed: { label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  cancelled: { label: 'Cancelled', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; shortLabel: string }> = {
  purchase_order: { label: 'Purchase Order', shortLabel: 'PO' },
  sales_order: { label: 'Sales Order', shortLabel: 'SO' },
  transport_order: { label: 'Transport Order', shortLabel: 'TO' },
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-success', bgColor: 'bg-success-light' },
  medium: { label: 'Medium', color: 'text-warning', bgColor: 'bg-warning-light' },
  high: { label: 'High', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/20' },
};
