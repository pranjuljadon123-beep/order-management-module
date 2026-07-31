/**
 * DxProcure — single source of truth for the RFQ state machine,
 * incoterm-driven charge responsibility and mode-driven field logic.
 *
 * Every badge, filter and guard in the procurement UI must derive from
 * `deriveRfqStatus()` — never from a screen-local label.
 */

export type RfqWorkflowStatus =
  | 'OPEN'
  | 'UNDER_NEGOTIATION'
  | 'MY_APPROVAL'
  | 'CONFIRMED'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'CANCELLED';

export const RFQ_STATUS_ORDER: RfqWorkflowStatus[] = [
  'OPEN',
  'UNDER_NEGOTIATION',
  'MY_APPROVAL',
  'CONFIRMED',
  'CLOSED',
  'ARCHIVED',
];

/** Retention window after which CONFIRMED / CLOSED records auto-archive. */
export const ARCHIVE_RETENTION_DAYS = 30;

export const RFQ_STATUS_META: Record<
  RfqWorkflowStatus,
  { label: string; className: string }
> = {
  OPEN: { label: 'Open', className: 'bg-info-light text-info' },
  UNDER_NEGOTIATION: { label: 'Under Negotiation', className: 'bg-warning-light text-warning' },
  MY_APPROVAL: { label: 'My Approval', className: 'bg-cyan-light text-accent' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-success-light text-success' },
  CLOSED: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
  ARCHIVED: { label: 'Archived', className: 'bg-secondary text-secondary-foreground' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
};

/** CANCELLED is reachable from anything before CLOSED. */
export const ALLOWED_TRANSITIONS: Record<RfqWorkflowStatus, RfqWorkflowStatus[]> = {
  OPEN: ['UNDER_NEGOTIATION', 'MY_APPROVAL', 'CONFIRMED', 'CLOSED', 'CANCELLED'],
  UNDER_NEGOTIATION: ['MY_APPROVAL', 'CONFIRMED', 'CLOSED', 'CANCELLED'],
  MY_APPROVAL: ['UNDER_NEGOTIATION', 'CONFIRMED', 'CLOSED', 'CANCELLED'],
  CONFIRMED: ['CLOSED', 'ARCHIVED', 'CANCELLED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: ['ARCHIVED'],
};

export function canTransition(from: RfqWorkflowStatus, to: RfqWorkflowStatus) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Legacy status column → workflow status (used for records created before the state machine). */
const LEGACY_MAP: Record<string, RfqWorkflowStatus> = {
  draft: 'OPEN',
  published: 'OPEN',
  bidding: 'OPEN',
  open: 'OPEN',
  evaluation: 'UNDER_NEGOTIATION',
  under_negotiation: 'UNDER_NEGOTIATION',
  my_approval: 'MY_APPROVAL',
  awarded: 'CONFIRMED',
  confirmed: 'CONFIRMED',
  closed: 'CLOSED',
  expired: 'CLOSED',
  archived: 'ARCHIVED',
  cancelled: 'CANCELLED',
};

export interface RfqLike {
  id?: string;
  status?: string;
  workflow_status?: string | null;
  terminal_status?: string | null;
  archived_at?: string | null;
  status_changed_at?: string | null;
  bid_deadline?: string | null;
  deadline_at?: string | null;
  required_quantity?: number | null;
  allocated_quantity?: number | null;
  updated_at?: string;
  created_at?: string;
}

export interface DerivedRfqStatus {
  status: RfqWorkflowStatus;
  /** Original terminal status kept visible behind ARCHIVED. */
  terminal?: RfqWorkflowStatus;
  /** e.g. "ARCHIVED — CONFIRMED" */
  label: string;
  className: string;
  deadlineMs: number | null;
  deadlinePassed: boolean;
  bidsOpen: boolean;
  isTerminal: boolean;
}

function baseStatus(rfq: RfqLike): RfqWorkflowStatus {
  const explicit = rfq.workflow_status as RfqWorkflowStatus | undefined | null;
  if (explicit && RFQ_STATUS_META[explicit]) return explicit;
  return LEGACY_MAP[(rfq.status || '').toLowerCase()] ?? 'OPEN';
}

function deadlineOf(rfq: RfqLike) {
  const raw = rfq.bid_deadline || rfq.deadline_at;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Pure derivation: applies auto-transitions (deadline expiry, retention archiving)
 * on top of the persisted status. `now` is injectable for testing.
 */
export function deriveRfqStatus(rfq: RfqLike, now: number = Date.now()): DerivedRfqStatus {
  let status = baseStatus(rfq);
  let terminal = (rfq.terminal_status as RfqWorkflowStatus | undefined) || undefined;

  const deadlineMs = deadlineOf(rfq);
  const deadlinePassed = deadlineMs != null && deadlineMs <= now;

  const required = rfq.required_quantity ?? 0;
  const allocated = rfq.allocated_quantity ?? 0;
  const fullyAllocated = required > 0 && allocated >= required;

  // Bid window ended with nothing confirmed → CLOSED (never stuck in OPEN).
  if ((status === 'OPEN' || status === 'UNDER_NEGOTIATION' || status === 'MY_APPROVAL') && deadlinePassed && allocated <= 0) {
    status = 'CLOSED';
  }

  // Fully allocated confirmed RFQ → CLOSED.
  if (status === 'CONFIRMED' && (fullyAllocated || deadlinePassed)) {
    status = 'CLOSED';
  }

  // Retention archiving (background job also persists this).
  if (status === 'CONFIRMED' || status === 'CLOSED' || status === 'CANCELLED') {
    const since = new Date(
      rfq.archived_at || rfq.status_changed_at || rfq.updated_at || rfq.created_at || now
    ).getTime();
    if (rfq.archived_at || now - since >= ARCHIVE_RETENTION_DAYS * 86400_000) {
      terminal = terminal || status;
      status = 'ARCHIVED';
    }
  }

  const meta = RFQ_STATUS_META[status];
  const label =
    status === 'ARCHIVED' && terminal
      ? `${meta.label} — ${RFQ_STATUS_META[terminal].label}`
      : meta.label;

  return {
    status,
    terminal,
    label: label.toUpperCase(),
    className: meta.className,
    deadlineMs,
    deadlinePassed,
    bidsOpen: (status === 'OPEN' || status === 'UNDER_NEGOTIATION') && !deadlinePassed,
    isTerminal: status === 'ARCHIVED' || status === 'CANCELLED',
  };
}

export interface StatusFilterBucket {
  key: string;
  label: string;
  match: (d: DerivedRfqStatus) => boolean;
}

/** List-view left rail filters — all driven off the single derived status. */
export const RFQ_STATUS_FILTERS: StatusFilterBucket[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'OPEN', label: 'Open', match: (d) => d.status === 'OPEN' },
  { key: 'MY_APPROVAL', label: 'My Approval', match: (d) => d.status === 'MY_APPROVAL' },
  { key: 'UNDER_NEGOTIATION', label: 'Under Negotiation', match: (d) => d.status === 'UNDER_NEGOTIATION' },
  { key: 'CONFIRMED', label: 'Confirmed', match: (d) => d.status === 'CONFIRMED' },
  { key: 'CLOSED', label: 'Closed', match: (d) => d.status === 'CLOSED' },
  { key: 'ARCHIVED', label: 'Archived', match: (d) => d.status === 'ARCHIVED' },
  { key: 'CANCELLED', label: 'Cancelled', match: (d) => d.status === 'CANCELLED' },
];

/* ------------------------------------------------------------------ */
/* Incoterm-driven charge responsibility                               */
/* ------------------------------------------------------------------ */

export interface IncotermRule {
  /** Charges the buyer (RFQ owner) must ask vendors to quote at origin. */
  origin: string[];
  destination: string[];
  /** Main-carriage freight arranged by the counterparty → nothing to bid. */
  freightByCounterparty: boolean;
  note: string;
}

export const INCOTERM_RULES: Record<string, IncotermRule> = {
  EXW: { origin: [], destination: [], freightByCounterparty: true, note: 'Seller makes goods available at premises — the buying party arranges all carriage. No freight to procure at origin.' },
  FCA: { origin: ['Export Customs Clearance', 'Origin Haulage'], destination: ['Ocean/Air Freight', 'Destination THC', 'Import Customs Clearance', 'Delivery'], freightByCounterparty: false, note: 'Seller delivers to named place; buyer carries main freight onward.' },
  FAS: { origin: ['Origin Haulage'], destination: ['Ocean Freight', 'Destination THC', 'Import Clearance'], freightByCounterparty: false, note: 'Delivered alongside vessel — loading and main carriage on buyer.' },
  FOB: { origin: ['Origin THC', 'Export Customs Clearance', 'Bill of Lading Charges'], destination: ['Ocean Freight', 'Destination THC', 'Import Customs Clearance', 'Last-Mile Delivery'], freightByCounterparty: false, note: 'Seller clears at origin; buyer pays freight from port of loading.' },
  CFR: { origin: ['Origin THC', 'Export Clearance', 'Ocean Freight'], destination: ['Destination THC', 'Import Clearance', 'Last-Mile Delivery'], freightByCounterparty: false, note: 'Freight prepaid to destination port; insurance on buyer.' },
  CIF: { origin: ['Origin THC', 'Export Clearance', 'Ocean Freight', 'Marine Insurance'], destination: ['Destination THC', 'Import Clearance', 'Last-Mile Delivery'], freightByCounterparty: false, note: 'Freight and insurance prepaid to destination port.' },
  CPT: { origin: ['Origin Handling', 'Export Clearance', 'Main Carriage'], destination: ['Destination Handling', 'Import Clearance'], freightByCounterparty: false, note: 'Carriage paid to named destination.' },
  CIP: { origin: ['Origin Handling', 'Export Clearance', 'Main Carriage', 'Insurance'], destination: ['Destination Handling', 'Import Clearance'], freightByCounterparty: false, note: 'Carriage and insurance paid to named destination.' },
  DAP: { origin: ['Origin Handling', 'Export Clearance', 'Main Carriage'], destination: ['Destination THC', 'Delivery to Named Place'], freightByCounterparty: false, note: 'Delivered at place, import duties on buyer.' },
  DPU: { origin: ['Origin Handling', 'Export Clearance', 'Main Carriage'], destination: ['Destination THC', 'Unloading at Named Place'], freightByCounterparty: false, note: 'Delivered and unloaded at named place.' },
  DDP: { origin: ['Origin Handling', 'Export Clearance', 'Main Carriage'], destination: ['Destination THC', 'Import Duties & Taxes', 'Door Delivery'], freightByCounterparty: true, note: 'Seller delivers duty paid — freight is arranged by the seller, nothing to procure.' },
};

export function getIncotermRule(incoterm?: string | null): IncotermRule | null {
  if (!incoterm) return null;
  return INCOTERM_RULES[incoterm.toUpperCase()] ?? null;
}

/**
 * "Freight Not Required" empty state — driven by incoterm + pick & drop,
 * not a hardcoded message.
 */
export function isFreightNotRequired(incoterm?: string | null, pickDrop?: string | null) {
  const rule = getIncotermRule(incoterm);
  if (!rule) return false;
  if (!rule.freightByCounterparty) return false;
  const pd = (pickDrop || '').toUpperCase();
  // EXW/DDP only need freight procurement if the buyer explicitly takes a door leg.
  if (incoterm?.toUpperCase() === 'EXW' && pd.startsWith('DOOR')) return false;
  if (incoterm?.toUpperCase() === 'DDP' && pd.includes('DOOR')) return true;
  return true;
}

/* ------------------------------------------------------------------ */
/* Mode-driven field logic                                             */
/* ------------------------------------------------------------------ */

export type DxMode = 'FCL' | 'LCL' | 'AIR' | 'FTL' | 'LTL' | 'Rail FCL' | 'Rail LCL';

export const CONTAINER_MODES: string[] = ['FCL', 'Rail FCL', 'ocean_fcl', 'rail_fcl'];

export function isContainerMode(mode?: string | null) {
  if (!mode) return false;
  return CONTAINER_MODES.includes(mode) || /fcl/i.test(mode);
}

export function isWeightVolumeMode(mode?: string | null) {
  return !isContainerMode(mode);
}

export const CONTAINER_SIZES = ['20ft', '40ft', '40ft HC', '45ft'];

/* ------------------------------------------------------------------ */
/* Allocation                                                          */
/* ------------------------------------------------------------------ */

export interface AllocationState {
  required: number;
  allocated: number;
  remaining: number;
  fullyAllocated: boolean;
}

export function computeAllocation(required: number, allocated: number): AllocationState {
  const req = Math.max(0, required || 0);
  const alloc = Math.max(0, allocated || 0);
  return {
    required: req,
    allocated: alloc,
    remaining: Math.max(0, req - alloc),
    fullyAllocated: req > 0 && alloc >= req,
  };
}

export function validateAllocation(qty: number, state: AllocationState): string | null {
  if (!Number.isFinite(qty) || qty <= 0) return 'Enter a quantity greater than zero.';
  if (state.required > 0 && qty > state.remaining) {
    return `Only ${state.remaining} of ${state.required} unit(s) remain unallocated on this RFQ.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Dispatch lifecycle (separate field from RFQ status)                 */
/* ------------------------------------------------------------------ */

export type DispatchStatus =
  | 'NEW_DISPATCH'
  | 'BOOKING_CONFIRMED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'CANCELLED';

export const DISPATCH_STATUS_META: Record<DispatchStatus, { label: string; className: string }> = {
  NEW_DISPATCH: { label: 'New Dispatch', className: 'bg-info-light text-info' },
  BOOKING_CONFIRMED: { label: 'Booking Confirmed', className: 'bg-cyan-light text-accent' },
  IN_TRANSIT: { label: 'In Transit', className: 'bg-warning-light text-warning' },
  ARRIVED: { label: 'Arrived', className: 'bg-success-light text-success' },
  DELIVERED: { label: 'Delivered', className: 'bg-success-light text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
};

export const DISPATCH_FLOW: DispatchStatus[] = [
  'NEW_DISPATCH',
  'BOOKING_CONFIRMED',
  'IN_TRANSIT',
  'ARRIVED',
  'DELIVERED',
];
