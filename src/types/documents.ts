export type DocumentStatus = 
  | 'draft'
  | 'pending_review'
  | 'reviewed'
  | 'approved'
  | 'submitted'
  | 'rejected';

export type DocumentType =
  | 'commercial_invoice'
  | 'packing_list'
  | 'bill_of_lading'
  | 'airway_bill'
  | 'shipping_instructions'
  | 'certificate_of_origin'
  | 'insurance_certificate'
  | 'proof_of_delivery'
  | 'customs_declaration'
  | 'inspection_certificate'
  | 'other';

export interface Document {
  id: string;
  document_number: string;
  document_type: DocumentType;
  document_name: string;
  
  // Linking
  order_id?: string;
  shipment_id?: string;
  
  // Status & workflow
  status: DocumentStatus;
  
  // File info
  file_url?: string;
  file_size?: number;
  file_type?: string;
  
  // Content
  content_data?: Record<string, unknown>;
  template_id?: string;
  
  // Validation
  validation_status?: string;
  validation_errors?: ValidationIssue[];
  validation_warnings?: ValidationIssue[];
  risk_score?: number;
  
  // Versioning
  version: number;
  is_latest?: boolean;
  parent_document_id?: string;
  
  // Audit
  created_by?: string;
  uploaded_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  submitted_by?: string;
  submitted_at?: string;
  
  // Metadata
  incoterms?: string;
  country_of_origin?: string;
  destination_country?: string;
  metadata?: Record<string, unknown>;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  order?: { order_number: string };
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  content_data: Record<string, unknown>;
  file_url?: string;
  changed_by?: string;
  change_reason?: string;
  changes_summary?: string;
  created_at: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  parent_comment_id?: string;
  user_id?: string;
  user_name?: string;
  content: string;
  is_resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  document_type: DocumentType;
  template_name: string;
  template_data: Record<string, unknown>;
  country_code?: string;
  incoterms?: string[];
  is_default?: boolean;
  is_active?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentEvent {
  id: string;
  document_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  triggered_by?: string;
  triggered_by_system?: string;
  processed?: boolean;
  processed_at?: string;
  created_at: string;
}

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  pending_review: { label: 'Pending Review', color: 'text-warning', bgColor: 'bg-warning-light' },
  reviewed: { label: 'Reviewed', color: 'text-info', bgColor: 'bg-info-light' },
  approved: { label: 'Approved', color: 'text-success', bgColor: 'bg-success-light' },
  submitted: { label: 'Submitted', color: 'text-primary', bgColor: 'bg-accent' },
  rejected: { label: 'Rejected', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; shortLabel: string; icon: string }> = {
  commercial_invoice: { label: 'Commercial Invoice', shortLabel: 'CI', icon: 'FileText' },
  packing_list: { label: 'Packing List', shortLabel: 'PL', icon: 'Package' },
  bill_of_lading: { label: 'Bill of Lading', shortLabel: 'B/L', icon: 'Ship' },
  airway_bill: { label: 'Air Waybill', shortLabel: 'AWB', icon: 'Plane' },
  shipping_instructions: { label: 'Shipping Instructions', shortLabel: 'SI', icon: 'FileText' },
  certificate_of_origin: { label: 'Certificate of Origin', shortLabel: 'COO', icon: 'Award' },
  insurance_certificate: { label: 'Insurance Certificate', shortLabel: 'IC', icon: 'Shield' },
  proof_of_delivery: { label: 'Proof of Delivery', shortLabel: 'POD', icon: 'CheckCircle' },
  customs_declaration: { label: 'Customs Declaration', shortLabel: 'CD', icon: 'FileCheck' },
  inspection_certificate: { label: 'Inspection Certificate', shortLabel: 'INSP', icon: 'ClipboardCheck' },
  other: { label: 'Other', shortLabel: 'OTH', icon: 'File' },
};
