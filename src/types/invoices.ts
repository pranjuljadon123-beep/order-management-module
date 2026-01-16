// Invoice Module Types

export type InvoiceStatus = 
  | "pending" 
  | "pending_approval" 
  | "approved" 
  | "auto_approved" 
  | "rejected" 
  | "payment_processed" 
  | "canceled" 
  | "archived";

export type TransportMode = "fcl" | "lcl" | "air" | "road" | "rail";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  gid: string;
  mode: TransportMode;
  vendor: {
    id: string;
    name: string;
  };
  origin: {
    port: string;
    country: string;
    countryCode: string;
  };
  destination: {
    port: string;
    country: string;
    countryCode: string;
  };
  status: InvoiceStatus;
  approvers: string[];
  uploadedAt: Date;
  reuploadedAt?: Date;
  invoiceAmount: number;
  expectedAmount: number;
  currency: string;
  hasAttachment: boolean;
  isStarred: boolean;
  isPriority: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceFilter = 
  | "all" 
  | "payment_processed" 
  | "approved" 
  | "pending_approval" 
  | "rejected" 
  | "canceled" 
  | "archived" 
  | "starred";

export interface InvoiceStats {
  all: number;
  paymentProcessed: number;
  approved: number;
  pendingApproval: number;
  rejected: number;
  canceled: number;
  archived: number;
  starred: number;
}
