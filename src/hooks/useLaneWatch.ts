import { useCallback, useMemo, useState } from 'react';
import type {
  DecisionRecord, DisruptionEvent, EventVerdict, LaneWatchShipment, LaneWatchUser,
} from '@/types/lanewatch';
import { deriveStatus, applyHumanReview, compareForWarningList, assertAdvisable } from '@/lib/lanewatch/validation';
import { buildExposure, connectionSegmentPercentages, delayDays } from '@/lib/lanewatch/exposure';
import { scope, scopedFind, scopedFindByRef } from '@/lib/lanewatch/guards';
import {
  DEMO_USERS, decisionOptions, events as seedEvents, purchaseOrders,
  recipients as seedRecipients, shipments as seedShipments, signals as seedSignals,
} from '@/mock/lanewatchSeed';

/**
 * Single read path for every LaneWatch view.
 *
 * Components never touch the seed arrays and never compute a status. They read
 * what this hook returns. That is what keeps the two screens that show the same
 * PO from ever disagreeing about whether it is tight.
 */
export function useLaneWatch(user: LaneWatchUser = DEMO_USERS.controller) {
  const [eventState, setEventState] = useState<DisruptionEvent[]>(seedEvents);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);

  // Everything below starts from a scoped read. No view sees another tenant.
  const myEvents = useMemo(() => scope(eventState, user), [eventState, user]);
  const mySignals = useMemo(() => scope(seedSignals, user), [user]);
  const myShipments = useMemo(() => scope(seedShipments, user), [user]);
  const myPos = useMemo(() => scope(purchaseOrders, user), [user]);
  const myRecipients = useMemo(() => scope(seedRecipients, user), [user]);

  const verdicts = useMemo(() => {
    const m = new Map<string, EventVerdict>();
    for (const e of myEvents) m.set(e.id, deriveStatus(e, mySignals));
    return m;
  }, [myEvents, mySignals]);

  const warnings = useMemo(() => {
    const rows: Array<{ event: DisruptionEvent; verdict: EventVerdict }> = [];
    for (const event of myEvents) {
      const verdict = verdicts.get(event.id);
      if (verdict) rows.push({ event, verdict });
    }
    return rows.sort(compareForWarningList);
  }, [myEvents, verdicts]);

  const exposures = useMemo(() => {
    const m = new Map<string, ReturnType<typeof buildExposure>>();
    for (const e of myEvents) m.set(e.id, buildExposure(e, myShipments, myPos));
    return m;
  }, [myEvents, myShipments, myPos]);

  /** Shipments touching any live warning, with the strongest status attached. */
  const touchedShipments = useMemo(() => {
    const rows: Array<{ shipment: LaneWatchShipment; event: DisruptionEvent; verdict: EventVerdict; delay: number | null }> = [];
    for (const { event, verdict } of warnings) {
      const exp = exposures.get(event.id);
      if (!exp) continue;
      for (const id of exp.shipmentIds) {
        const s = myShipments.find((x) => x.id === id);
        if (!s) continue;
        if (rows.some((r) => r.shipment.id === id && r.verdict.status === 'ACT_NOW')) continue;
        rows.push({ shipment: s, event, verdict, delay: delayDays(s) });
      }
    }
    return rows;
  }, [warnings, exposures, myShipments]);

  const stats = useMemo(() => {
    const act = warnings.filter((w) => w.verdict.status === 'ACT_NOW');
    const watch = warnings.filter((w) => w.verdict.status === 'WATCH');
    const tied = new Set(touchedShipments.map((r) => r.shipment.id));
    return {
      inTransit: myShipments.length,
      ocean: myShipments.filter((s) => s.mode === 'ocean').length,
      air: myShipments.filter((s) => s.mode === 'air').length,
      tiedToRisk: tied.size,
      actNow: act.length,
      watch: watch.length,
      signalsScanned: mySignals.length,
      sourceMix: {
        weather: mySignals.filter((s) => s.channel === 'weather').length,
        official: mySignals.filter((s) => s.channel === 'official').length,
        social: mySignals.filter((s) => s.channel === 'social').length,
        news: mySignals.filter((s) => s.channel === 'news').length,
      },
    };
  }, [warnings, touchedShipments, myShipments, mySignals]);

  const connectionSegments = useMemo(() => {
    const segments = new Map<string, number[]>();
    for (const shipment of myShipments) {
      if (!shipment.connection) continue;
      const { bufferMinutes, slowdownMinutes, overrunMinutes } = shipment.connection;
      segments.set(shipment.id, connectionSegmentPercentages([bufferMinutes, slowdownMinutes, overrunMinutes]));
    }
    return segments;
  }, [myShipments]);

  const getEvent = useCallback((id: string) => scopedFind(eventState, user, id), [eventState, user]);

  const getShipment = useCallback(
    (ref: string) =>
      scopedFindByRef(seedShipments, user, ref, (s) => [s.id, s.reference, s.transportDoc.replace(/\s/g, '')]),
    [user],
  );

  const getSignalsFor = useCallback(
    (eventId: string) =>
      mySignals.filter((s) => s.eventId === eventId).sort((a, b) => a.observedAt.localeCompare(b.observedAt)),
    [mySignals],
  );

  /**
   * Decision options are withheld on a watch. The view asks for them rather
   * than reading the record, so the refusal is centralised.
   */
  const getDecisionOptions = useCallback(
    (eventId: string) => {
      const event = getEvent(eventId);
      if (!event) return { allowed: false as const, reason: 'Event not found.', options: [] };
      const gate = assertAdvisable(event, mySignals);
      if (gate.allowed === false) return { allowed: false as const, reason: gate.reason, options: [] };
      return { allowed: true as const, reason: null, options: decisionOptions[eventId] ?? [] };
    },
    [getEvent, mySignals],
  );

  const reviewEvent = useCallback(
    (eventId: string, note?: string) => {
      const event = getEvent(eventId);
      if (!event) return { ok: false as const, error: 'not_found' };
      try {
        const { event: next, verdict, changed } = applyHumanReview(event, mySignals, user, note);
        setEventState((prev) => prev.map((e) => (e.id === eventId ? next : e)));
        return { ok: true as const, verdict, changed };
      } catch (e) {
        return { ok: false as const, error: (e as Error).message };
      }
    },
    [getEvent, mySignals, user],
  );

  const recordDecision = useCallback(
    (eventId: string, chosenKey: DecisionRecord['chosenKey'], reason: string) => {
      const gate = getDecisionOptions(eventId);
      if (!gate.allowed) return { ok: false as const, error: gate.reason };
      const rec: DecisionRecord = {
        id: `dec_${Date.now()}`,
        tenantId: user.tenantId,
        eventId,
        chosenKey,
        reason,
        decidedBy: user.name,
        decidedAt: new Date().toISOString(),
      };
      setDecisions((prev) => [rec, ...prev]);
      return { ok: true as const, record: rec };
    },
    [getDecisionOptions, user],
  );

  return {
    user,
    events: myEvents,
    shipments: myShipments,
    purchaseOrders: myPos,
    recipients: myRecipients,
    signals: mySignals,
    verdicts,
    warnings,
    exposures,
    touchedShipments,
    stats,
    connectionSegments,
    decisions,
    getEvent,
    getShipment,
    getSignalsFor,
    getDecisionOptions,
    reviewEvent,
    recordDecision,
  };
}
