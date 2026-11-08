import type {
  AlertRecipient, DecisionOption, DisruptionEvent, LaneWatchShipment,
  LaneWatchUser, PurchaseOrder, Signal,
} from '@/types/lanewatch';

/**
 * Fictional demo data reproducing the LaneWatch concept mockups.
 *
 * Everything here is invented. No real company, vessel, flight, shipment, PO or
 * event appears. The UI carries a demo badge wherever this data is shown, so a
 * prospect is never left thinking a concept screen is a live integration.
 *
 * A second tenant is seeded on purpose. It exists so the isolation tests have
 * something real to fail against: a reference that genuinely exists in the
 * table but must read as not found for the wrong tenant.
 */

export const TENANT = 'tnt_lanewatch_demo';
export const OTHER_TENANT = 'tnt_other_customer';

export const DEMO_USERS: Record<string, LaneWatchUser> = {
  controller: { id: 'u_logistics_head', name: 'Logistics head', tenantId: TENANT, role: 'controller' },
  coordinator: { id: 'u_coordinator', name: 'Ops coordinator', tenantId: TENANT, role: 'coordinator' },
  viewer: { id: 'u_viewer', name: 'Plant planner', tenantId: TENANT, role: 'viewer' },
  outsider: { id: 'u_other', name: 'Other Co', tenantId: OTHER_TENANT, role: 'controller' },
};

/* ------------------------------------------------------------------ events */

export const events: DisruptionEvent[] = [
  {
    id: 'ev_cyclone_gujarat',
    tenantId: TENANT,
    code: 'EV-1107-03',
    title: 'Cyclone toward Gujarat-Konkan coast',
    summary:
      'Deep depression to cyclonic storm, landfall window 08-09 Nov; port ops at Mundra and Nhava Sheva likely suspended',
    category: 'cyclone',
    geographies: ['Nhava Sheva', 'Mundra'],
    firstSignalAt: '2026-11-07T00:22:00.000Z', // 05:52 IST
    affectedFrom: '2026-11-08T06:30:00.000Z',  // 08 Nov 12:00 IST
    affectedTo: '2026-11-10T00:30:00.000Z',    // 10 Nov 06:00 IST
    review: { reviewedBy: 'Ops coordinator', reviewedAt: '2026-11-07T02:40:00.000Z', note: 'Port advisory read in full' },
    escalatedAt: '2026-11-07T02:40:00.000Z',   // 08:10 IST
  },
  {
    id: 'ev_bhiwandi_strike',
    tenantId: TENANT,
    code: 'EV-1107-04',
    title: "Truckers' strike call, Bhiwandi-JNPT corridor",
    summary: '14 public posts calling a bandh on the Bhiwandi to JNPT corridor. No official or news confirmation yet.',
    category: 'strike',
    geographies: ['Bhiwandi', 'Nhava Sheva'],
    firstSignalAt: '2026-11-07T02:05:00.000Z', // 07:35 IST
    affectedFrom: '2026-11-08T02:30:00.000Z',
    affectedTo: '2026-11-09T12:30:00.000Z',
    review: null,
    escalatedAt: null,
  },
  {
    id: 'ev_dxb_duststorm',
    tenantId: TENANT,
    code: 'EV-1107-05',
    title: 'Dust-storm advisory, Dubai - DXB ground ops slowdown',
    summary: 'NCM Dubai advisory; ramp handling slowed, transfer connections at risk.',
    category: 'other',
    geographies: ['Jebel Ali / DXB', 'DXB'],
    firstSignalAt: '2026-11-07T00:50:00.000Z', // 06:20 IST
    affectedFrom: '2026-11-07T01:30:00.000Z',
    affectedTo: '2026-11-08T06:00:00.000Z',
    review: { reviewedBy: 'Ops coordinator', reviewedAt: '2026-11-07T01:35:00.000Z' },
    escalatedAt: '2026-11-07T01:35:00.000Z',   // 07:05 IST
  },
];

/* ----------------------------------------------------------------- signals */

export const signals: Signal[] = [
  // Cyclone: the full evidence trail from the mockup, in order.
  {
    id: 'sig_c1', tenantId: TENANT, eventId: 'ev_cyclone_gujarat',
    channel: 'weather', authority: 'official', sourceName: 'IMD (official met agency)',
    headline: 'IMD bulletin: depression over E. Arabian Sea, track NNE',
    observedAt: '2026-11-07T00:22:00.000Z',
  },
  {
    id: 'sig_c2', tenantId: TENANT, eventId: 'ev_cyclone_gujarat',
    channel: 'weather', authority: 'official', sourceName: 'GDACS (intl. disaster feed)',
    headline: 'GDACS tropical cyclone alert - orange',
    observedAt: '2026-11-07T01:00:00.000Z',
  },
  {
    id: 'sig_c3', tenantId: TENANT, eventId: 'ev_cyclone_gujarat',
    channel: 'social', authority: 'unverified', sourceName: 'Public X posts',
    headline: 'Port-area posts: "gates closing early" (9 posts)',
    observedAt: '2026-11-07T01:18:00.000Z',
  },
  {
    id: 'sig_c4', tenantId: TENANT, eventId: 'ev_cyclone_gujarat',
    channel: 'news', authority: 'independent', sourceName: 'Regional outlet A', outletId: 'outlet_regional_a',
    headline: 'Regional outlet A: port preparing for storm',
    observedAt: '2026-11-07T01:45:00.000Z',
  },
  {
    id: 'sig_c5', tenantId: TENANT, eventId: 'ev_cyclone_gujarat',
    channel: 'official', authority: 'official', sourceName: 'Port authority',
    headline: 'Port authority advisory: berthing suspended from 08 Nov 12:00',
    observedAt: '2026-11-07T02:40:00.000Z',
  },
  {
    id: 'sig_c6', tenantId: TENANT, eventId: 'ev_cyclone_gujarat',
    channel: 'news', authority: 'independent', sourceName: 'National outlet B', outletId: 'outlet_national_b',
    headline: 'National outlet B carries the story',
    observedAt: '2026-11-07T04:10:00.000Z',
  },

  // Strike: social only. This event must never escalate on this evidence.
  {
    id: 'sig_s1', tenantId: TENANT, eventId: 'ev_bhiwandi_strike',
    channel: 'social', authority: 'unverified', sourceName: 'Public X posts',
    headline: 'Bandh call circulating, Bhiwandi transporters (14 posts)',
    observedAt: '2026-11-07T02:05:00.000Z',
  },

  // Dust storm: one official source plus a single outlet.
  {
    id: 'sig_d1', tenantId: TENANT, eventId: 'ev_dxb_duststorm',
    channel: 'official', authority: 'official', sourceName: 'NCM Dubai advisory',
    headline: 'NCM Dubai: blowing dust, reduced visibility, ramp ops affected',
    observedAt: '2026-11-07T00:50:00.000Z',
  },
  {
    id: 'sig_d2', tenantId: TENANT, eventId: 'ev_dxb_duststorm',
    channel: 'news', authority: 'independent', sourceName: 'Gulf outlet C', outletId: 'outlet_gulf_c',
    headline: 'Flights delayed as dust reduces visibility',
    observedAt: '2026-11-07T01:20:00.000Z',
  },
];

/* --------------------------------------------------------------- shipments */

export const shipments: LaneWatchShipment[] = [
  {
    id: 'shp_oc_2318', tenantId: TENANT, reference: 'OC-2318', mode: 'ocean',
    transportDoc: 'MSKU 7741026', equipment: '40 ft reefer', carrier: 'Demo Line (fictional)', vesselOrFlight: 'MV Arabian Lark · 046E',
    lane: 'Nhava Sheva → Colombo → Newark',
    origin: 'Nhava Sheva', via: 'Colombo', destination: 'Newark',
    cargo: 'Demo Pharma Ltd · APIs, 18 t',
    plannedDeparture: '2026-11-07T00:00:00.000Z',
    plannedArrival: '2026-12-02T00:00:00.000Z',
    revisedArrivalFrom: '2026-12-05T00:00:00.000Z',
    revisedArrivalTo: '2026-12-08T00:00:00.000Z',
    arrivalProvenance: 'lanewatch_estimate',
    linkedPoIds: ['po_4471', 'po_4473', 'po_4480'],
    milestones: [
      { key: 'empty_pickup', label: 'Empty pickup', plannedAt: '2026-10-26', actualAt: '2026-10-27', state: 'done' },
      { key: 'gate_in', label: 'Gate-in', plannedAt: '2026-10-30', actualAt: '2026-10-30', state: 'done' },
      { key: 'loaded', label: 'Loaded', plannedAt: '2026-11-04', actualAt: '2026-11-04', state: 'done' },
      { key: 'etd', label: 'Departure (ETD)', plannedAt: '2026-11-07', estimatedFrom: '2026-11-09', estimatedTo: '2026-11-09', state: 'held' },
      { key: 'ts_colombo', label: 'T/S Colombo', plannedAt: '2026-11-11', estimatedFrom: '2026-11-13', estimatedTo: '2026-11-14', state: 'pending' },
      { key: 'arrival', label: 'Arrival Newark', plannedAt: '2026-12-02', estimatedFrom: '2026-12-05', estimatedTo: '2026-12-08', state: 'pending' },
      { key: 'available', label: 'Available', plannedAt: '2026-12-04', estimatedFrom: '2026-12-07', estimatedTo: '2026-12-10', state: 'pending' },
    ],
  },
  {
    id: 'shp_ar_0912', tenantId: TENANT, reference: 'AR-0912', mode: 'air',
    transportDoc: '176-48213390', equipment: '12 pcs · 640 kg', carrier: 'Demo Air (fictional)', vesselOrFlight: 'DL-501 · DL-235 (fictional)',
    lane: 'BOM → DXB → ORD',
    origin: 'BOM', via: 'DXB', destination: 'ORD',
    cargo: 'Vaccine intermediate · 2-8 °C · 12 pcs · 640 kg',
    plannedDeparture: '2026-11-10T18:00:00.000Z',
    plannedArrival: '2026-11-11T10:20:00.000Z',
    revisedArrivalFrom: '2026-11-11T10:20:00.000Z',
    revisedArrivalTo: '2026-11-12T18:00:00.000Z',
    arrivalProvenance: 'lanewatch_estimate',
    linkedPoIds: ['po_4502', 'po_4505'],
    connection: {
      scheduled: '3h 15m', slowdown: '2h 20m', bufferUsed: '1h 15m', slowdownAmount: '2h 20m', overrun: '25m',
      bufferMinutes: 75, slowdownMinutes: 140, overrunMinutes: 25,
      coldChain: 'Confirm active temperature logging during the ground hold.',
      nextProtectedFlight: 'DL-235 · illustrative connection',
      customerFacingEta: '12 Nov · estimated window',
      validationSignalId: 'sig_d1',
    },
    suggestedActions: [
      'Ask the forwarder to confirm temperature monitoring during the transfer hold.',
      'Request protected-space confirmation on the next available connection.',
      'Share the estimated arrival window with the receiving team.',
    ],
    milestones: [
      { key: 'rcs_bom', label: 'RCS BOM', plannedAt: '2026-11-10T18:00:00.000Z', actualAt: '2026-11-10T18:12:00.000Z', state: 'done' },
      { key: 'dep_bom', label: 'DEP BOM', plannedAt: '2026-11-10T23:30:00.000Z', actualAt: '2026-11-10T23:41:00.000Z', state: 'done' },
      { key: 'arr_dxb', label: 'ARR DXB', plannedAt: '2026-11-11T01:55:00.000Z', actualAt: '2026-11-11T02:20:00.000Z', state: 'done' },
      { key: 'transfer_dxb', label: 'Transfer DXB', plannedAt: '2026-11-11T02:05:00.000Z', state: 'held' },
      { key: 'dep_dxb', label: 'DEP DXB', plannedAt: '2026-11-11T04:00:00.000Z', estimatedFrom: '2026-11-11T04:00:00.000Z', estimatedTo: '2026-11-11T09:00:00.000Z', state: 'active' },
      { key: 'arr_ord', label: 'ARR ORD', plannedAt: '2026-11-11T10:20:00.000Z', estimatedFrom: '2026-11-11T10:20:00.000Z', estimatedTo: '2026-11-12T10:20:00.000Z', state: 'pending' },
      { key: 'nfd', label: 'NFD / DLV', plannedAt: '2026-11-11T16:00:00.000Z', estimatedFrom: '2026-11-12T16:00:00.000Z', estimatedTo: '2026-11-12T16:00:00.000Z', state: 'pending' },
    ],
  },
  {
    id: 'shp_oc_2324', tenantId: TENANT, reference: 'OC-2324', mode: 'ocean',
    transportDoc: 'MSKU 8810044', equipment: '40 ft', carrier: 'Demo Line (fictional)', vesselOrFlight: 'MV Demo Pioneer · 112W',
    lane: 'Mundra → Jebel Ali → Hamburg',
    origin: 'Mundra', via: 'Jebel Ali / DXB', destination: 'Hamburg',
    cargo: 'Demo Chem Ltd · solvent, 20 t',
    plannedDeparture: '2026-11-08T00:00:00.000Z',
    plannedArrival: '2026-12-12T00:00:00.000Z',
    revisedArrivalFrom: '2026-12-12T00:00:00.000Z',
    revisedArrivalTo: '2026-12-16T00:00:00.000Z',
    arrivalProvenance: 'lanewatch_estimate',
    linkedPoIds: ['po_4490'],
    milestones: [
      { key: 'gate_in', label: 'Gate-in', plannedAt: '2026-11-08', estimatedFrom: '2026-11-10', estimatedTo: '2026-11-10', state: 'held' },
      { key: 'loaded', label: 'Loaded', plannedAt: '2026-11-10', state: 'pending' },
      { key: 'arrival', label: 'Arrival Hamburg', plannedAt: '2026-12-12', estimatedFrom: '2026-12-12', estimatedTo: '2026-12-16', state: 'pending' },
    ],
  },
  {
    id: 'shp_oc_2297', tenantId: TENANT, reference: 'OC-2297', mode: 'ocean',
    transportDoc: 'MSKU 6620913', equipment: '20 ft', carrier: 'Demo Line (fictional)', vesselOrFlight: 'MV Demo Trader · 031E',
    lane: 'Shanghai → Nhava Sheva',
    origin: 'Shanghai', via: null, destination: 'Nhava Sheva',
    cargo: 'Demo Pharma Ltd · packaging, 6 t',
    plannedDeparture: '2026-10-30T00:00:00.000Z',
    plannedArrival: '2026-11-14T00:00:00.000Z',
    revisedArrivalFrom: null,
    revisedArrivalTo: null,
    arrivalProvenance: 'plan',
    linkedPoIds: ['po_4459'],
    milestones: [
      { key: 'loaded', label: 'Loaded', plannedAt: '2026-10-30', actualAt: '2026-10-30', state: 'done' },
      { key: 'arrival', label: 'Arrival Nhava Sheva', plannedAt: '2026-11-14', state: 'pending' },
    ],
  },

  // Belongs to a different customer. Present so isolation can be tested against
  // a reference that genuinely exists.
  {
    id: 'shp_other_1', tenantId: OTHER_TENANT, reference: 'ZZ-9001', mode: 'ocean',
    transportDoc: 'ONEU1234567', carrier: 'Other Line', vesselOrFlight: 'MV Elsewhere · 001E',
    lane: 'Busan → Oakland', origin: 'Busan', via: null, destination: 'Oakland',
    cargo: 'Confidential', plannedDeparture: '2026-11-01T00:00:00.000Z', plannedArrival: '2026-11-20T00:00:00.000Z',
    revisedArrivalFrom: null, revisedArrivalTo: null, arrivalProvenance: 'plan',
    linkedPoIds: [], milestones: [],
  },
];

/* ---------------------------------------------------------------------- POs */

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'po_4471', tenantId: TENANT, poNumber: 'PO-4471', item: 'Metformin API', quantity: '9 t', counterparty: 'Demo Pharma Ltd', needBy: '2026-12-10', shipmentId: 'shp_oc_2318' },
  { id: 'po_4473', tenantId: TENANT, poNumber: 'PO-4473', item: 'Excipient blend', quantity: '6 t', counterparty: 'Demo Pharma Ltd', needBy: '2026-12-06', shipmentId: 'shp_oc_2318' },
  { id: 'po_4480', tenantId: TENANT, poNumber: 'PO-4480', item: 'Packaging film', quantity: '3 t', counterparty: 'Demo Pharma Ltd', needBy: '2026-12-20', shipmentId: 'shp_oc_2318' },
  { id: 'po_4490', tenantId: TENANT, poNumber: 'PO-4490', item: 'Solvent (chem)', quantity: '20 t', counterparty: 'Demo Chem Ltd', needBy: '2026-12-18', shipmentId: 'shp_oc_2324' },
  // Explicit time: this one is wanted in the morning, so an afternoon arrival is late.
  { id: 'po_4502', tenantId: TENANT, poNumber: 'PO-4502', item: 'Vaccine intermediate', quantity: '12 pcs', counterparty: 'Demo Biologics Inc.', needBy: '2026-11-12T12:00:00.000Z', shipmentId: 'shp_ar_0912' },
  { id: 'po_4505', tenantId: TENANT, poNumber: 'PO-4505', item: 'Fill-finish consumables', quantity: '4 pcs', counterparty: 'Demo Fill-Finish LLC', needBy: '2026-11-15', shipmentId: 'shp_ar_0912' },
  { id: 'po_4459', tenantId: TENANT, poNumber: 'PO-4459', item: 'Carton stock', quantity: '6 t', counterparty: 'Demo Pharma Ltd', needBy: '2026-11-28', shipmentId: 'shp_oc_2297' },
  { id: 'po_other', tenantId: OTHER_TENANT, poNumber: 'PO-9999', item: 'Confidential', quantity: '1 t', counterparty: 'Other Co', needBy: '2026-11-30', shipmentId: 'shp_other_1' },
];

/* ----------------------------------------------------------- decision set */

export const decisionOptions: Record<string, DecisionOption[]> = {
  ev_cyclone_gujarat: [
    { key: 'A', title: 'Wait for next sailing (09 Nov)', detail: 'No extra cost. PO-4473 may slip 0-2 days.', tradeoff: 'Low cost / some risk', tone: 'cost' },
    { key: 'B', title: 'Air-freight part of PO-4473 (1.5 t)', detail: 'Covers line need. Indicative cost only, get a quote.', tradeoff: 'Higher cost / low risk', tone: 'risk' },
    { key: 'C', title: 'Draw safety stock, re-sequence batch', detail: 'Buys about 4 days at the plant. Check stock levels.', tradeoff: 'Internal / no freight', tone: 'internal' },
    { key: 'D', title: 'Pre-warn customer and update ETA', detail: 'Revised window 05-08 Dec shared early.', tradeoff: 'Relationship', tone: 'relationship' },
  ],
};

export const recipients: AlertRecipient[] = [
  { id: 'rcp_1', tenantId: TENANT, name: 'Logistics head', channel: 'whatsapp', maskedHandle: '******4821' },
  { id: 'rcp_2', tenantId: TENANT, name: 'Plant planner', channel: 'email', maskedHandle: 'pl*******@demo-pharma.example' },
  { id: 'rcp_3', tenantId: TENANT, name: 'Ops channel', channel: 'slack', maskedHandle: '#ops-****' },
  { id: 'rcp_other', tenantId: OTHER_TENANT, name: 'Other Co ops', channel: 'email', maskedHandle: 'op*@other.example' },
];

/** Shown on every LaneWatch screen. Not decorative. */
export const DEMO_NOTICE =
  'Concept module with illustrative demo data. Companies, shipments, POs, dates and events are fictional. ' +
  'Live carrier, AWB and flight integrations are not in place.';
