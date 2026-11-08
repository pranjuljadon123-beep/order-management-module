import { test } from 'node:test';
import assert from 'node:assert/strict';

import { deriveStatus, applyHumanReview, assertDispatchable, assertAdvisable } from '../src/lib/lanewatch/validation.ts';
import { classifyPo, buildExposure, slackDays } from '../src/lib/lanewatch/exposure.ts';
import { scope, scopedFind, scopedFindByRef, maskHandle, safeSignalForLog, dispatchAlert, assertNoClientSideSourceKeys } from '../src/lib/lanewatch/guards.ts';
import {
  DEMO_USERS, events, signals, shipments, purchaseOrders, recipients, TENANT, OTHER_TENANT,
} from '../src/mock/lanewatchSeed.ts';
import type { DisruptionEvent, Signal } from '../src/types/lanewatch.ts';

const controller = DEMO_USERS.controller;
const viewer = DEMO_USERS.viewer;
const outsider = DEMO_USERS.outsider;

const ev = (id: string) => {
  const event = events.find((row) => row.id === id);
  if (!event) throw new Error(`Missing seeded event: ${id}`);
  return event;
};

function sig(over: Partial<Signal>): Signal {
  return {
    id: `s_${Math.random().toString(36).slice(2)}`,
    tenantId: TENANT,
    eventId: 'ev_test',
    channel: 'social',
    authority: 'unverified',
    sourceName: 'test',
    headline: 'test',
    observedAt: '2026-11-07T00:00:00.000Z',
    ...over,
  };
}

const bareEvent: DisruptionEvent = {
  id: 'ev_test', tenantId: TENANT, code: 'EV-TEST', title: 't', summary: 's',
  category: 'other', geographies: ['Nhava Sheva'],
  firstSignalAt: '2026-11-07T00:00:00.000Z',
  affectedFrom: '2026-11-08T00:00:00.000Z', affectedTo: '2026-11-09T00:00:00.000Z',
  review: null, escalatedAt: null,
};

/* ================================================================= L2: rumour */

test('L2 volume is not weight: a hundred social posts stay a watch', () => {
  const many = Array.from({ length: 100 }, () => sig({}));
  const v = deriveStatus(bareEvent, many);
  assert.equal(v.status, 'WATCH');
  assert.equal(v.corroborated, false);
  assert.equal(v.dispatchable, false);
  assert.match(v.blockers[0], /Social only/);
});

test('L2 syndication is not corroboration: two stories, one outlet', () => {
  const v = deriveStatus(bareEvent, [
    sig({ channel: 'news', authority: 'independent', outletId: 'outlet_a', headline: 'first' }),
    sig({ channel: 'news', authority: 'independent', outletId: 'outlet_a', headline: 'syndicated copy' }),
  ]);
  assert.equal(v.independentOutletCount, 1);
  assert.equal(v.status, 'WATCH');
  assert.match(v.blockers[0], /One outlet so far/);
});

test('L2 two genuinely different outlets corroborate, but still need a person', () => {
  const two = [
    sig({ channel: 'news', authority: 'independent', outletId: 'outlet_a' }),
    sig({ channel: 'news', authority: 'independent', outletId: 'outlet_b' }),
  ];
  const v = deriveStatus(bareEvent, two);
  assert.equal(v.corroborated, true);
  assert.equal(v.status, 'WATCH', 'corroboration alone must not escalate');
  assert.match(v.blockers[0], /not yet checked by a person/);

  const after = applyHumanReview(bareEvent, two, controller);
  assert.equal(after.verdict.status, 'ACT_NOW');
  assert.equal(after.changed, true);
});

test('L2 a news signal with no outlet id cannot corroborate: the record fails closed', () => {
  const v = deriveStatus(bareEvent, [
    sig({ channel: 'news', authority: 'independent', outletId: 'outlet_a' }),
    sig({ channel: 'news', authority: 'independent' }), // outletId missing
  ]);
  assert.equal(v.independentOutletCount, 1);
  assert.equal(v.status, 'WATCH');
});

test('L2 one official source is enough to corroborate', () => {
  const one = [sig({ channel: 'weather', authority: 'official', sourceName: 'IMD' })];
  assert.equal(deriveStatus(bareEvent, one).corroborated, true);
  assert.equal(applyHumanReview(bareEvent, one, controller).verdict.status, 'ACT_NOW');
});

test('L2 review alone never promotes: signing off a rumour leaves it a watch', () => {
  const social = [sig({}), sig({})];
  const after = applyHumanReview(bareEvent, social, controller);
  assert.equal(after.verdict.status, 'WATCH');
  assert.equal(after.changed, false);
  assert.equal(after.event.escalatedAt, null);
});

test('L2 a retraction demotes an event that had already escalated', () => {
  const live = [
    sig({ id: 'off1', channel: 'official', authority: 'official', sourceName: 'Port authority' }),
  ];
  const reviewed = applyHumanReview(bareEvent, live, controller).event;
  assert.equal(deriveStatus(reviewed, live).status, 'ACT_NOW');

  const retracted = live.map((s) => ({ ...s, retractedAt: '2026-11-07T06:00:00.000Z' }));
  assert.equal(deriveStatus(reviewed, retracted).status, 'WATCH');
});

test('L2 evidence from another event cannot be borrowed', () => {
  const foreign = [sig({ eventId: 'ev_somewhere_else', channel: 'official', authority: 'official' })];
  assert.equal(deriveStatus(bareEvent, foreign).status, 'WATCH');
});

test('L2 a viewer may not sign off', () => {
  assert.throws(() => applyHumanReview(bareEvent, [], viewer), /viewer may not sign off/);
});

test('L2 cross-tenant review is refused', () => {
  assert.throws(() => applyHumanReview(bareEvent, [], outsider), /cross-tenant/);
});

/* ============================================================== L3: dispatch */

test('L3 a watch is never pushed, and the refusal is recorded', () => {
  const strike = ev('ev_bhiwandi_strike');
  assert.equal(deriveStatus(strike, signals).status, 'WATCH');

  let sent = 0;
  const attempts = dispatchAlert({
    user: controller, event: strike, signals, recipients,
    send: () => { sent += 1; return true; },
  });

  assert.equal(sent, 0, 'nothing may leave the product on a watch');
  assert.equal(attempts.length, 3, 'own-tenant recipients only');
  assert.ok(attempts.every((a) => !a.delivered));
  assert.ok(attempts.every((a) => /WATCH/.test(a.blockedReason ?? '')));
});

test('L3 an act-now event does send', () => {
  const cyclone = ev('ev_cyclone_gujarat');
  assert.equal(deriveStatus(cyclone, signals).status, 'ACT_NOW');

  const attempts = dispatchAlert({
    user: controller, event: cyclone, signals, recipients, send: () => true,
  });
  assert.equal(attempts.filter((a) => a.delivered).length, 3);
});

test('L3 decision options are withheld on a watch', () => {
  const strike = ev('ev_bhiwandi_strike');
  const gate = assertAdvisable(strike, signals);
  assert.equal(gate.allowed, false);

  const cyclone = ev('ev_cyclone_gujarat');
  assert.equal(assertAdvisable(cyclone, signals).allowed, true);
});

test('L3 dispatchable and advisable always agree with status', () => {
  for (const e of events) {
    const v = deriveStatus(e, signals);
    assert.equal(v.dispatchable, v.status === 'ACT_NOW');
    assert.equal(v.advisable, v.status === 'ACT_NOW');
    assert.equal(assertDispatchable(e, signals).allowed, v.status === 'ACT_NOW');
  }
});

/* ================================================================ L1: tenant */

test('L1 scope never returns another tenant rows', () => {
  assert.ok(scope(shipments, controller).every((s) => s.tenantId === TENANT));
  assert.ok(scope(shipments, outsider).every((s) => s.tenantId === OTHER_TENANT));
  assert.ok(!scope(shipments, controller).some((s) => s.reference === 'ZZ-9001'));
});

test('L1 a real id from another tenant reads as not found, not as forbidden', () => {
  assert.equal(scopedFind(shipments, controller, 'shp_other_1'), undefined);
  assert.equal(scopedFind(shipments, outsider, 'shp_other_1')?.reference, 'ZZ-9001');
});

test('L1 search by reference is scoped too', () => {
  const pick = (s: (typeof shipments)[number]) => [s.id, s.reference, s.transportDoc.replace(/\s/g, '')];
  assert.equal(scopedFindByRef(shipments, controller, 'ZZ-9001', pick), undefined);
  assert.equal(scopedFindByRef(shipments, controller, 'ONEU1234567', pick), undefined);
  assert.equal(scopedFindByRef(shipments, controller, 'MSKU7741026', pick)?.reference, 'OC-2318');
});

test('L1 exposure never crosses tenants even when geography matches', () => {
  const crossTenantEvent = { ...ev('ev_cyclone_gujarat'), tenantId: OTHER_TENANT };
  const exp = buildExposure(crossTenantEvent, shipments, purchaseOrders);
  assert.equal(exp.shipmentIds.length, 0);
  assert.equal(exp.poExposures.length, 0);
});

/* ============================================= L4: no fabricated arithmetic */

test('L4 PO buckets match the mockup exactly', () => {
  const worst = '2026-12-08T00:00:00.000Z'; // 05-08 Dec window, late end

  assert.equal(classifyPo('2026-12-10', worst).status, 'TIGHT');   // PO-4471, 2 days slack
  assert.equal(classifyPo('2026-12-06', worst).status, 'AT_RISK'); // PO-4473, lands after need-by
  assert.equal(classifyPo('2026-12-20', worst).status, 'OK');      // PO-4480, 12 days slack
});

test('L4 a date with no time means end of day, so morning arrival is not late', () => {
  assert.equal(slackDays('2026-12-10', '2026-12-10T09:00:00.000Z'), 0);
  assert.equal(classifyPo('2026-12-10', '2026-12-10T09:00:00.000Z').status, 'TIGHT');
  assert.equal(classifyPo('2026-12-10', '2026-12-11T09:00:00.000Z').status, 'AT_RISK');
});

test('L4 an explicit slot is honoured: 12 Nov AM is missed by a 12 Nov PM arrival', () => {
  assert.equal(classifyPo('2026-11-12T12:00:00.000Z', '2026-11-12T18:00:00.000Z').status, 'AT_RISK');
  assert.equal(classifyPo('2026-11-15', '2026-11-12T18:00:00.000Z').status, 'OK');
});

test('L4 the worst end of a window decides, never the optimistic end', () => {
  const optimistic = classifyPo('2026-12-06', '2026-12-05T00:00:00.000Z');
  const pessimistic = classifyPo('2026-12-06', '2026-12-08T00:00:00.000Z');
  assert.equal(optimistic.status, 'TIGHT');
  assert.equal(pessimistic.status, 'AT_RISK');
});

test('L4 no revised window means no invented delay', () => {
  const c = classifyPo('2026-11-28', null);
  assert.equal(c.slackDays, null);
  assert.equal(c.status, 'OK');
  assert.match(c.rationale, /running to plan/);
});

test('L4 the cyclone exposure reproduces the mockup counts', () => {
  const exp = buildExposure(ev('ev_cyclone_gujarat'), shipments, purchaseOrders);
  assert.equal(exp.counts.shipments, 3, 'OC-2318, OC-2324 and OC-2297 all touch Nhava Sheva or Mundra');
  assert.equal(exp.counts.lanes, 3);
  assert.equal(exp.poExposures[0].status, 'AT_RISK');
  assert.equal(exp.poExposures[0].poNumber, 'PO-4473', 'worst first');
  const byNumber = Object.fromEntries(exp.poExposures.map((p) => [p.poNumber, p.status]));
  assert.equal(byNumber['PO-4471'], 'TIGHT');
  assert.equal(byNumber['PO-4480'], 'OK');
});

test('L4 every verdict carries its own explanation', () => {
  for (const e of events) {
    const v = deriveStatus(e, signals);
    if (v.status === 'ACT_NOW') assert.ok(v.reasons.length > 0, `${e.code} must say why it escalated`);
    else assert.ok(v.blockers.length > 0, `${e.code} must say what is missing`);
  }
});

/* ============================================== L5 / L6: secrets and privacy */

test('L5 source credentials in the browser bundle fail the build', () => {
  assert.throws(
    () => assertNoClientSideSourceKeys({ VITE_IMD_API_KEY: 'x' }),
    /must not be exposed to the browser/,
  );
  assert.throws(() => assertNoClientSideSourceKeys({ VITE_TWILIO_TOKEN: 'x' }), /Remove/);
  assert.doesNotThrow(() => assertNoClientSideSourceKeys({ VITE_APP_TITLE: 'LaneWatch' }));
});

test('L6 handles are masked for display', () => {
  assert.equal(maskHandle('+91 98200 14821'), '********4821');
  assert.equal(maskHandle('planner@demo-pharma.example'), 'pl*****@demo-pharma.example');
  assert.ok(!maskHandle('+91 98200 14821').includes('98200'));
});

test('L6 log records carry no third-party body text', () => {
  const row = safeSignalForLog(signals[2]);
  assert.equal('headline' in row, false);
  assert.equal('url' in row, false);
  assert.equal(row.hasUrl, false);
  assert.equal(row.authority, 'unverified');
});

/* ========================================================= seed sanity check */

test('seed reproduces the three mockup warnings with the right statuses', () => {
  assert.equal(deriveStatus(ev('ev_cyclone_gujarat'), signals).status, 'ACT_NOW');
  assert.equal(deriveStatus(ev('ev_bhiwandi_strike'), signals).status, 'WATCH');
  assert.equal(deriveStatus(ev('ev_dxb_duststorm'), signals).status, 'ACT_NOW');
});

test('no seed record sets a status directly', () => {
  for (const e of events) {
    assert.equal('status' in e, false, `${e.code} must not carry a hardcoded status`);
  }
});
