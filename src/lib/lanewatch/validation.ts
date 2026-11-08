import type {
  DisruptionEvent, EventStatus, EventVerdict, Signal, LaneWatchUser,
} from '@/types/lanewatch';

/**
 * The validation rule. This file is the product.
 *
 * LaneWatch's claim to a customer is that it is early *without* being a rumour
 * mill. That claim survives only if one function decides what may be acted on,
 * and nothing else in the codebase can reach around it.
 *
 *   WATCH    a signal exists. Shown in the app. Never pushed to a phone, never
 *            attached to purchase-order advice, never given decision options.
 *   ACT NOW  at least one official source, or two genuinely independent news
 *            outlets, AND a named person has signed it off.
 *
 * Three ways a rumour historically becomes an instruction, all closed here:
 *
 *   1. Volume mistaken for weight. Forty posts saying the port is shut is one
 *      unverified signal, not forty. Only `authority` is counted.
 *   2. Syndication mistaken for corroboration. The same wire story on two sites
 *      is one outlet. Outlets are de-duplicated by `outletId` before counting.
 *   3. Automation mistaken for judgement. Sources can be wrong together. A
 *      person signs off, and their name is on the record.
 *
 * Rules for anyone editing this file:
 *   - `deriveStatus` is the only way a status is produced anywhere in LaneWatch.
 *   - No component, hook or seed may set `status` on an event.
 *   - Every branch that would widen what counts needs a test alongside it.
 */

/** Signals that are withdrawn stop counting, including retroactively. */
function live(signals: Signal[]): Signal[] {
  return signals.filter((s) => !s.retractedAt);
}

/**
 * Independent outlets, de-duplicated.
 *
 * A news signal with no `outletId` cannot be shown to be independent of
 * anything, so it is not counted. Failing closed is the whole point: an
 * incomplete record must never be the thing that promotes an event.
 */
function countIndependentOutlets(signals: Signal[]): string[] {
  const ids = new Set<string>();
  for (const s of signals) {
    if (s.authority !== 'independent') continue;
    if (s.channel !== 'news') continue;
    if (!s.outletId) continue;
    ids.add(s.outletId);
  }
  return [...ids];
}

function countOfficial(signals: Signal[]): number {
  return signals.filter((s) => s.authority === 'official').length;
}

export const RULE = {
  MIN_OFFICIAL: 1,
  MIN_INDEPENDENT_OUTLETS: 2,
  REQUIRE_HUMAN_REVIEW: true,
} as const;

/**
 * The single source of truth for an event's status.
 *
 * Pure: same inputs, same verdict, no clock, no network, no store. That is what
 * makes it testable, and what lets the evidence panel explain itself honestly.
 */
export function deriveStatus(event: DisruptionEvent, allSignals: Signal[]): EventVerdict {
  // Defence in depth. Callers are supposed to pass this event's own signals;
  // if they pass the whole table, another event's evidence must not leak in.
  const signals = live(
    allSignals.filter((s) => s.eventId === event.id && s.tenantId === event.tenantId),
  );

  const officialCount = countOfficial(signals);
  const countedOutletIds = countIndependentOutlets(signals);
  const independentOutletCount = countedOutletIds.length;

  const byOfficial = officialCount >= RULE.MIN_OFFICIAL;
  const byNews = independentOutletCount >= RULE.MIN_INDEPENDENT_OUTLETS;
  const corroborated = byOfficial || byNews;

  const reviewed = Boolean(event.review?.reviewedAt && event.review?.reviewedBy);
  const status: EventStatus =
    corroborated && (!RULE.REQUIRE_HUMAN_REVIEW || reviewed) ? 'ACT_NOW' : 'WATCH';

  const reasons: string[] = [];
  const blockers: string[] = [];

  if (byOfficial) {
    const names = signals.filter((s) => s.authority === 'official').map((s) => s.sourceName);
    reasons.push(`${officialCount} official source${officialCount > 1 ? 's' : ''}: ${names.join(', ')}`);
  }
  if (byNews) {
    reasons.push(`${independentOutletCount} independent news outlets reporting`);
  }
  if (event.review?.reviewedBy) {
    reasons.push(`Checked by ${event.review.reviewedBy}`);
  }

  if (!corroborated) {
    const socialOnly = signals.length > 0 && signals.every((s) => s.authority === 'unverified');
    if (socialOnly) {
      blockers.push(
        `Social only: ${signals.length} unverified post${signals.length > 1 ? 's' : ''}. ` +
          'Needs an official source or two independent outlets.',
      );
    } else if (independentOutletCount === 1) {
      blockers.push('One outlet so far. A second, unrelated outlet or an official source is needed.');
    } else {
      blockers.push('No official source and fewer than two independent outlets.');
    }
  }
  if (corroborated && !reviewed) {
    blockers.push('Corroborated but not yet checked by a person.');
  }

  return {
    status,
    corroborated,
    officialCount,
    independentOutletCount,
    countedOutletIds,
    // A watch is visible, never audible, and never advisory. Both of these are
    // read directly by the dispatcher and by the impact view.
    dispatchable: status === 'ACT_NOW',
    advisable: status === 'ACT_NOW',
    reasons,
    blockers,
    watchPolicy: [
      'Social-only signals remain visible in-app, but are never pushed as an action.',
      'No purchase-order decisions are advised while an event is a watch.',
    ],
    actNowRule: ['At least 1 official source, or 2 independent news outlets, plus human sign-off.'],
  };
}

/**
 * Guard for the notification path.
 *
 * The dispatcher calls this and nothing else. Returning a reason rather than a
 * bare false means the refusal lands in the audit log in a readable form.
 */
export function assertDispatchable(
  event: DisruptionEvent,
  signals: Signal[],
): { allowed: true } | { allowed: false; reason: string } {
  const v = deriveStatus(event, signals);
  if (!v.dispatchable) {
    return {
      allowed: false,
      reason: `Event ${event.code} is ${v.status}. ${v.blockers[0] ?? 'Not corroborated.'}`,
    };
  }
  return { allowed: true };
}

/**
 * Guard for the advice path.
 *
 * "No PO decisions advised" on a watch is a promise printed in the product
 * brief, so the impact view asks here before it renders options.
 */
export function assertAdvisable(
  event: DisruptionEvent,
  signals: Signal[],
): { allowed: true } | { allowed: false; reason: string } {
  const v = deriveStatus(event, signals);
  if (!v.advisable) {
    return {
      allowed: false,
      reason: 'Decision options are withheld until this is confirmed by an official source or two independent outlets and checked by a person.',
    };
  }
  return { allowed: true };
}

/**
 * Sign-off. Returns a new event rather than mutating, so the caller writes the
 * audit row and the old value stays reconstructible.
 *
 * Review alone does not promote anything. An event with nothing but social
 * posts stays a watch after review, which is why this recomputes rather than
 * assuming.
 */
export function applyHumanReview(
  event: DisruptionEvent,
  signals: Signal[],
  user: LaneWatchUser,
  note?: string,
  now: string = new Date().toISOString(),
): { event: DisruptionEvent; verdict: EventVerdict; changed: boolean } {
  if (user.tenantId !== event.tenantId) {
    throw new Error('cross-tenant review refused');
  }
  if (user.role === 'viewer') {
    throw new Error('viewer may not sign off an event');
  }

  const before = deriveStatus(event, signals).status;
  const reviewed: DisruptionEvent = {
    ...event,
    review: { reviewedBy: user.name, reviewedAt: now, note },
  };
  const verdict = deriveStatus(reviewed, signals);
  const changed = verdict.status !== before;

  return {
    event: { ...reviewed, escalatedAt: verdict.status === 'ACT_NOW' ? (event.escalatedAt ?? now) : null },
    verdict,
    changed,
  };
}

/**
 * Ordering for the warnings list: act-now first, then by first signal, newest
 * first. Kept here so every list in the module sorts identically.
 */
export function compareForWarningList(
  a: { verdict: EventVerdict; event: DisruptionEvent },
  b: { verdict: EventVerdict; event: DisruptionEvent },
): number {
  if (a.verdict.status !== b.verdict.status) return a.verdict.status === 'ACT_NOW' ? -1 : 1;
  return b.event.firstSignalAt.localeCompare(a.event.firstSignalAt);
}
