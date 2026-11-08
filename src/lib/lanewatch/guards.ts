import type {
  AlertRecipient, DisruptionEvent, DispatchAttempt, LaneWatchUser, Signal, TenantId,
} from '@/types/lanewatch';
import { assertDispatchable } from './validation';

/**
 * The containment layer: tenant scoping, dispatch refusal, and the handling of
 * anything that should not be rendered or logged in full.
 *
 * These are small functions on purpose. Each one closes a leak that is easy to
 * open again during a refactor, and each has a test naming the leak.
 */

/* --------------------------------------------------------- tenant scoping */

/**
 * Filter any tenant-owned collection down to one tenant.
 *
 * Call this at the edge of every read. There is no row-level security behind
 * this module in the current build, so this function is the only thing standing
 * between two customers' data.
 */
export function scope<T extends { tenantId: TenantId }>(rows: T[], user: LaneWatchUser): T[] {
  return rows.filter((r) => r.tenantId === user.tenantId);
}

/**
 * Fetch one record by id, scoped.
 *
 * Returns undefined for a record that exists under another tenant, which is the
 * same answer as for one that does not exist at all. Distinguishing the two
 * tells an attacker which ids are real.
 */
export function scopedFind<T extends { id: string; tenantId: TenantId }>(
  rows: T[],
  user: LaneWatchUser,
  id: string,
): T | undefined {
  const row = rows.find((r) => r.id === id);
  if (!row || row.tenantId !== user.tenantId) return undefined;
  return row;
}

/** Same, for the human-facing references people paste into a search box. */
export function scopedFindByRef<T extends { tenantId: TenantId }>(
  rows: T[],
  user: LaneWatchUser,
  ref: string,
  pick: (row: T) => string[],
): T | undefined {
  const needle = ref.trim().toUpperCase();
  const row = rows.find((r) => pick(r).some((v) => String(v ?? '').toUpperCase() === needle));
  if (!row || row.tenantId !== user.tenantId) return undefined;
  return row;
}

/* ------------------------------------------------------------- dispatching */

/**
 * The only way an alert leaves the product.
 *
 * A watch is shown on screen and never sent. The refusal is recorded rather
 * than dropped, so "why did nobody get told" has an answer later.
 */
export function dispatchAlert(args: {
  user: LaneWatchUser;
  event: DisruptionEvent;
  signals: Signal[];
  recipients: AlertRecipient[];
  now?: string;
  send: (recipient: AlertRecipient) => boolean;
}): DispatchAttempt[] {
  const { user, event, signals, recipients, send } = args;
  const now = args.now ?? new Date().toISOString();

  if (event.tenantId !== user.tenantId) throw new Error('cross-tenant dispatch refused');

  const gate = assertDispatchable(event, signals);
  const mine = scope(recipients, user);

  return mine.map((r) => {
    if (gate.allowed === false) {
      return {
        id: `att_${event.id}_${r.id}`,
        tenantId: user.tenantId,
        eventId: event.id,
        recipientId: r.id,
        channel: r.channel,
        attemptedAt: now,
        delivered: false,
        blockedReason: gate.reason,
      };
    }
    const delivered = send(r);
    return {
      id: `att_${event.id}_${r.id}`,
      tenantId: user.tenantId,
      eventId: event.id,
      recipientId: r.id,
      channel: r.channel,
      attemptedAt: now,
      delivered,
      blockedReason: delivered ? null : 'channel error',
    };
  });
}

/* ------------------------------------------------------------- redaction */

/**
 * Mask a phone number or email for display.
 *
 * Recipient lists get screenshotted into decks and pasted into tickets. Nothing
 * in this module renders a full address, so a screenshot cannot carry one.
 */
export function maskHandle(raw: string): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (v.includes('@')) {
    const [name, domain] = v.split('@');
    const head = name.slice(0, 2);
    return `${head}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
  }
  const digits = v.replace(/\D/g, '');
  if (digits.length < 4) return '*'.repeat(v.length);
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

/**
 * Strip anything that must not reach a log line or an analytics event.
 *
 * Signal text is third-party content, which may itself carry a phone number or
 * a name. Log the identifier and the source, never the body.
 */
export function safeSignalForLog(s: Signal): Record<string, unknown> {
  return {
    id: s.id,
    eventId: s.eventId,
    channel: s.channel,
    authority: s.authority,
    sourceName: s.sourceName,
    outletId: s.outletId ?? null,
    observedAt: s.observedAt,
    hasUrl: Boolean(s.url),
    retracted: Boolean(s.retractedAt),
  };
}

/* ---------------------------------------------------------------- secrets */

/**
 * Fails the build loudly if a source credential is ever referenced from the
 * browser bundle. IMD, NOAA, GDACS and the social listeners are polled by the
 * backend; the frontend only ever reads rows that have already been stored.
 *
 * Call once at module init in development.
 */
export function assertNoClientSideSourceKeys(env: Record<string, unknown> = {}): void {
  const forbidden = Object.keys(env).filter((k) =>
    /^(VITE_)?(IMD|NOAA|GDACS|X_API|TWITTER|INSTAGRAM|META|NEWSAPI|WHATSAPP|TWILIO)_/i.test(k),
  );
  if (forbidden.length) {
    throw new Error(
      `LaneWatch: source credentials must not be exposed to the browser. Remove: ${forbidden.join(', ')}. ` +
        'Poll these feeds from the backend and store the resulting signals.',
    );
  }
}
