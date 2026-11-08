/**
 * LaneWatch domain types.
 *
 * One rule governs this whole module: a signal's *authority* decides whether an
 * event may be acted on, never its loudness. Everything here exists to make that
 * rule checkable by a machine instead of by a careful reader.
 */

export type TenantId = string;

/* ------------------------------------------------------------------ signals */

/** Where the signal arrived from. Presentation only. */
export type SignalChannel = 'weather' | 'official' | 'news' | 'social';

/**
 * How much the signal counts. This is the field the validation rule reads.
 *
 *  official     a named authority speaking for itself: IMD, NOAA, GDACS, a port
 *               authority, a carrier advisory, a customs or trade notice.
 *  independent  a news outlet reporting. Counts only together with a second,
 *               genuinely different outlet.
 *  unverified   social posts, forwarded messages, anything unattributable.
 *
 * A weather bulletin is channel 'weather' and authority 'official'. The two
 * fields are deliberately separate, because the badge a user sees and the
 * weight the rule applies are different questions.
 */
export type SignalAuthority = 'official' | 'independent' | 'unverified';

export interface Signal {
  id: string;
  tenantId: TenantId;
  eventId: string;
  channel: SignalChannel;
  authority: SignalAuthority;
  /** Who said it. Shown in the evidence trail. */
  sourceName: string;
  /**
   * Stable id of the publishing organisation. Two articles carrying the same
   * outletId are one outlet however many URLs they have: syndicated copy is the
   * classic way a single rumour counts twice. Required for 'independent'.
   */
  outletId?: string;
  headline: string;
  url?: string;
  observedAt: string;
  /** Set when a source withdraws a story. Retracted signals stop counting. */
  retractedAt?: string | null;
}

/* ------------------------------------------------------------------- events */

/**
 * WATCH    seen early, shown in-app, never pushed, never attached to advice.
 * ACT_NOW  corroborated by the rule below and signed off by a named person.
 */
export type EventStatus = 'WATCH' | 'ACT_NOW';

export type EventCategory =
  | 'cyclone' | 'flood' | 'port_closure' | 'congestion' | 'strike'
  | 'geopolitical' | 'customs' | 'regulatory' | 'accident' | 'other';

export interface HumanReview {
  reviewedBy: string;
  reviewedAt: string;
  note?: string;
}

export interface DisruptionEvent {
  id: string;
  tenantId: TenantId;
  code: string;
  title: string;
  summary: string;
  category: EventCategory;
  /** Ports, airports, corridors this touches. Used to match exposure. */
  geographies: string[];
  firstSignalAt: string;
  /** Window the disruption is expected to bite. Always an estimate. */
  affectedFrom: string;
  affectedTo: string;
  /**
   * Null until a person signs off. The rule treats null as "not actionable"
   * regardless of how many official sources are attached.
   */
  review?: HumanReview | null;
  /** Timestamps for the audit trail, written by the engine, never by a view. */
  escalatedAt?: string | null;
}

/** What the engine returns. Components read this; they never compute status. */
export interface EventVerdict {
  status: EventStatus;
  /** True when the corroboration test passes, review aside. */
  corroborated: boolean;
  officialCount: number;
  independentOutletCount: number;
  /** Which outlets were counted, after de-duplication. */
  countedOutletIds: string[];
  /** May this be pushed to WhatsApp, SMS, Slack, Teams or email? */
  dispatchable: boolean;
  /** May this event be attached to PO advice and decision options? */
  advisable: boolean;
  /** Plain sentences for the UI. Never assembled in a component. */
  reasons: string[];
  /** What is still missing, for the "why is this only a watch" panel. */
  blockers: string[];
  /** Presentation-safe policy text produced with the underlying verdict. */
  watchPolicy: string[];
  actNowRule: string[];
}

/* ---------------------------------------------------------------- shipments */

export type TransportMode = 'ocean' | 'air';

export type MilestoneState = 'done' | 'active' | 'pending' | 'held';

export interface Milestone {
  key: string;
  label: string;
  plannedAt: string;
  actualAt?: string | null;
  /** Set when the milestone has slipped into a range rather than a point. */
  estimatedFrom?: string | null;
  estimatedTo?: string | null;
  state: MilestoneState;
}

/**
 * Where a date came from. Rendered next to every date in the UI, because a
 * carrier commitment and a LaneWatch guess must never look alike on screen.
 */
export type Provenance = 'carrier_feed' | 'forwarder_update' | 'customer_update' | 'lanewatch_estimate' | 'plan';

export interface LaneWatchShipment {
  id: string;
  tenantId: TenantId;
  reference: string;
  mode: TransportMode;
  /** Container number for ocean, AWB for air. */
  transportDoc: string;
  equipment?: string;
  carrier: string;
  vesselOrFlight: string;
  lane: string;
  origin: string;
  via?: string | null;
  destination: string;
  cargo: string;
  plannedDeparture: string;
  plannedArrival: string;
  revisedArrivalFrom?: string | null;
  revisedArrivalTo?: string | null;
  arrivalProvenance: Provenance;
  milestones: Milestone[];
  linkedPoIds: string[];
  /** Illustrative connection details shown only for the fictional air demo. */
  connection?: {
    scheduled: string;
    slowdown: string;
    bufferUsed: string;
    slowdownAmount: string;
    overrun: string;
    bufferMinutes: number;
    slowdownMinutes: number;
    overrunMinutes: number;
    coldChain: string;
    nextProtectedFlight: string;
    customerFacingEta: string;
    validationSignalId: string;
  };
  suggestedActions?: string[];
}

/* ----------------------------------------------------------------------- PO */

export type PoStatus = 'OK' | 'TIGHT' | 'AT_RISK';

export interface PurchaseOrder {
  id: string;
  tenantId: TenantId;
  poNumber: string;
  item: string;
  quantity: string;
  counterparty: string;
  /**
   * ISO datetime. A date with no time means end of that day: a PO needed "on
   * 10 Dec" is not late at 09:00 on the 10th. Where a slot matters the seed
   * carries an explicit time, as with "12 Nov AM".
   */
  needBy: string;
  shipmentId?: string | null;
}

export interface PoExposure {
  poId: string;
  poNumber: string;
  item: string;
  needBy: string;
  revisedArrivalFrom: string | null;
  revisedArrivalTo: string | null;
  /** Whole days between the worst-case arrival and the need-by date. */
  slackDays: number | null;
  status: PoStatus;
  /** Why it landed in that bucket, for the tooltip. */
  rationale: string;
}

/* ----------------------------------------------------------------- exposure */

export interface EventExposure {
  eventId: string;
  shipmentIds: string[];
  poExposures: PoExposure[];
  counts: { shipments: number; pos: number; lanes: number; atRisk: number; tight: number };
}

/* ---------------------------------------------------------------- decisions */

export interface DecisionOption {
  key: 'A' | 'B' | 'C' | 'D';
  title: string;
  detail: string;
  /** Short chip under the option, e.g. "Low cost / some risk". */
  tradeoff: string;
  tone: 'cost' | 'risk' | 'internal' | 'relationship';
}

export interface DecisionRecord {
  id: string;
  tenantId: TenantId;
  eventId: string;
  chosenKey: DecisionOption['key'];
  reason: string;
  decidedBy: string;
  decidedAt: string;
}

/* -------------------------------------------------------------- dispatching */

export type AlertChannel = 'whatsapp' | 'email' | 'sms' | 'slack' | 'teams';

export interface AlertRecipient {
  id: string;
  tenantId: TenantId;
  name: string;
  channel: AlertChannel;
  /** Stored masked in this build. Never render or log a full address. */
  maskedHandle: string;
}

export interface DispatchAttempt {
  id: string;
  tenantId: TenantId;
  eventId: string;
  recipientId: string;
  channel: AlertChannel;
  attemptedAt: string;
  delivered: boolean;
  /** Populated when the engine refused the send. */
  blockedReason?: string | null;
}

/* ------------------------------------------------------------------ session */

export interface LaneWatchUser {
  id: string;
  name: string;
  tenantId: TenantId;
  role: 'viewer' | 'coordinator' | 'controller';
}
