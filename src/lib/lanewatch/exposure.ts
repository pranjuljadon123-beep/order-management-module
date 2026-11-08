import type {
  DisruptionEvent, EventExposure, LaneWatchShipment, PoExposure, PoStatus, PurchaseOrder,
} from '@/types/lanewatch';

/**
 * Exposure maths: which shipments an event touches, and what that does to the
 * purchase orders riding on them.
 *
 * Every date shown in the UI is produced here. No component does its own
 * arithmetic, because two components that disagree about whether a PO is tight
 * is how a customer stops trusting the screen.
 */

const DAY_MS = 86_400_000;

/** Days of slack below which a PO is tight rather than comfortable. */
export const TIGHT_THRESHOLD_DAYS = 3;

const IST_ZONE = 'Asia/Kolkata';

/** All LaneWatch dates are formatted here so views never invent date logic. */
export function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: IST_ZONE, ...options }).format(date);
}

export function formatTimeIST(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: IST_ZONE }).format(date);
}

export function formatDateTimeIST(value: string | null | undefined): string {
  if (!value) return '—';
  return `${formatTimeIST(value)} IST, ${formatDate(value)}`;
}

export function formatTimeLabelIST(value: string | null | undefined): string {
  return `${formatTimeIST(value)} IST`;
}

export function formatWindow(from: string | null | undefined, to: string | null | undefined): string {
  if (!from && !to) return '—';
  if (!from) return formatDate(to);
  if (!to || from === to) return formatDate(from);
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function connectionSegmentPercentages(values: number[]): number[] {
  const safe = values.map((value) => Math.max(0, value));
  const total = safe.reduce((sum, value) => sum + value, 0);
  if (total === 0) return safe.map(() => 0);
  return safe.map((value) => (value / total) * 100);
}

export function formatFirstLinkedPo(rows: PoExposure[]): string {
  const first = rows[0];
  if (!first) return '—';
  const additional = Math.max(0, rows.length - 1);
  return additional ? `${first.poNumber} +${additional}` : first.poNumber;
}

export function earliestEventCutoff(events: DisruptionEvent[]): string | null {
  return events.map((event) => event.affectedFrom).filter(Boolean).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] ?? null;
}

export function unverifiedSignalLabel(count: number): string {
  return `${count} unverified post${count === 1 ? '' : 's'} · not yet validated`;
}

/**
 * A need-by with no time means end of that day. A PO wanted "on 10 Dec" is not
 * late at nine in the morning on the 10th. Where the slot matters the record
 * carries an explicit time, as with a 12 Nov AM commitment.
 */
export function resolveNeedBy(needBy: string): Date {
  const hasTime = /T\d{2}:\d{2}/.test(needBy);
  if (hasTime) return new Date(needBy);
  return new Date(`${needBy.slice(0, 10)}T23:59:59.999Z`);
}

/** Whole days from the worst-case arrival to the need-by. Negative means late. */
export function slackDays(needBy: string, worstCaseArrival: string): number {
  const need = resolveNeedBy(needBy).getTime();
  const arrive = new Date(worstCaseArrival).getTime();
  return Math.floor((need - arrive) / DAY_MS);
}

export function classifyPo(
  needBy: string,
  worstCaseArrival: string | null,
  tightThreshold = TIGHT_THRESHOLD_DAYS,
): { status: PoStatus; slackDays: number | null; rationale: string } {
  if (!worstCaseArrival) {
    return { status: 'OK', slackDays: null, rationale: 'No revised arrival window; running to plan.' };
  }

  const need = resolveNeedBy(needBy).getTime();
  const arrive = new Date(worstCaseArrival).getTime();
  const slack = Math.floor((need - arrive) / DAY_MS);

  if (arrive > need) {
    return {
      status: 'AT_RISK',
      slackDays: slack,
      rationale: `Worst case lands after the need-by date${slack < 0 ? ` by ${Math.abs(slack)} day${Math.abs(slack) === 1 ? '' : 's'}` : ''}.`,
    };
  }
  if (slack < tightThreshold) {
    return {
      status: 'TIGHT',
      slackDays: slack,
      rationale: `${slack} day${slack === 1 ? '' : 's'} of slack against a ${tightThreshold}-day threshold.`,
    };
  }
  return { status: 'OK', slackDays: slack, rationale: `${slack} days of slack.` };
}

/**
 * Worst case out of a revised window. The late end is the one that decides
 * whether a line stops, so an optimistic read of a range is never used.
 */
export function worstCaseArrival(s: LaneWatchShipment): string | null {
  return s.revisedArrivalTo ?? s.revisedArrivalFrom ?? null;
}

/** Shipments an event touches, by geography overlap on origin, via or destination. */
export function shipmentsTouchedBy(
  event: DisruptionEvent,
  shipments: LaneWatchShipment[],
): LaneWatchShipment[] {
  const zones = new Set(event.geographies.map((g) => g.toLowerCase()));
  return shipments
    .filter((s) => s.tenantId === event.tenantId)
    .filter((s) =>
      [s.origin, s.via, s.destination]
        .filter(Boolean)
        .some((p) => zones.has(String(p).toLowerCase())),
    );
}

export function buildExposure(
  event: DisruptionEvent,
  shipments: LaneWatchShipment[],
  pos: PurchaseOrder[],
  tightThreshold = TIGHT_THRESHOLD_DAYS,
): EventExposure {
  const touched = shipmentsTouchedBy(event, shipments);
  const byId = new Map(touched.map((s) => [s.id, s]));

  const poExposures: PoExposure[] = pos
    .filter((p) => p.tenantId === event.tenantId)
    .flatMap((p) => {
      if (!p.shipmentId) return [];
      const s = byId.get(p.shipmentId);
      if (!s) return [];
      const worst = worstCaseArrival(s);
      const c = classifyPo(p.needBy, worst, tightThreshold);
      return [{
        poId: p.id,
        poNumber: p.poNumber,
        item: p.item,
        needBy: p.needBy,
        revisedArrivalFrom: s.revisedArrivalFrom ?? null,
        revisedArrivalTo: s.revisedArrivalTo ?? null,
        slackDays: c.slackDays,
        status: c.status,
        rationale: c.rationale,
      }];
    })
    // Worst first. The screen opens on what can stop a line.
    .sort((a, b) => {
      const rank: Record<PoStatus, number> = { AT_RISK: 0, TIGHT: 1, OK: 2 };
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      return (a.slackDays ?? 99) - (b.slackDays ?? 99);
    });

  return {
    eventId: event.id,
    shipmentIds: touched.map((s) => s.id),
    poExposures,
    counts: {
      shipments: touched.length,
      pos: poExposures.length,
      lanes: new Set(touched.map((s) => s.lane)).size,
      atRisk: poExposures.filter((p) => p.status === 'AT_RISK').length,
      tight: poExposures.filter((p) => p.status === 'TIGHT').length,
    },
  };
}

/**
 * Delay in days between plan and worst case, for the "revised window" column.
 * Returns null rather than zero when there is no revision, so the UI can show
 * a dash instead of implying a confident on-time read.
 */
export function delayDays(s: LaneWatchShipment): number | null {
  const worst = worstCaseArrival(s);
  if (!worst) return null;
  return Math.max(0, Math.round((new Date(worst).getTime() - new Date(s.plannedArrival).getTime()) / DAY_MS));
}
