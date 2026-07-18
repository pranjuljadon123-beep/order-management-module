/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock backend mimicking enough of the Supabase JS client API surface
 * (chainable query builder, auth, rpc, channels, functions.invoke) to
 * keep all existing hooks working without modification.
 *
 * Persists to localStorage so mutations survive reloads.
 */

const STORAGE_KEY = "daistrix.mockdb.v1";
const AUTH_KEY = "daistrix.mockauth.v1";

type Row = Record<string, any>;
type Store = Record<string, Row[]>;

function uid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
const nowIso = () => new Date().toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400_000).toISOString();

function seed(): Store {
  const carriers = [
    { id: uid(), name: "Maersk", code: "MAEU", scac: "MAEU", supported_modes: ["ocean_fcl"], mode: "ocean_fcl", rating: 4.6, is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "MSC", code: "MSCU", scac: "MSCU", supported_modes: ["ocean_fcl", "ocean_lcl"], mode: "ocean_fcl", rating: 4.4, is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "CMA CGM", code: "CMDU", scac: "CMDU", supported_modes: ["ocean_fcl"], mode: "ocean_fcl", rating: 4.3, is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Hapag-Lloyd", code: "HLCU", scac: "HLCU", supported_modes: ["ocean_fcl"], mode: "ocean_fcl", rating: 4.5, is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "ONE", code: "ONEY", scac: "ONEY", supported_modes: ["ocean_fcl"], mode: "ocean_fcl", rating: 4.2, is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Evergreen", code: "EGLV", scac: "EGLV", supported_modes: ["ocean_fcl"], mode: "ocean_fcl", rating: 4.1, is_active: true, created_at: nowIso(), updated_at: nowIso() },
  ];
  const customers = [
    { id: uid(), name: "Acme Global Trade", email: "ops@acme.com", country: "USA", city: "New York", is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Northwind Imports", email: "hello@northwind.com", country: "USA", city: "Seattle", is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Contoso Retail", email: "supply@contoso.com", country: "UK", city: "London", is_active: true, created_at: nowIso(), updated_at: nowIso() },
  ];
  const shippers = [
    { id: uid(), name: "Shanghai Manufacturing Co.", country: "China", city: "Shanghai", port_code: "CNSHA", address_line1: "1 Pudong Rd", is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Ho Chi Minh Textiles", country: "Vietnam", city: "Ho Chi Minh City", port_code: "VNSGN", address_line1: "12 Nguyen Hue", is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Rotterdam Chemicals BV", country: "Netherlands", city: "Rotterdam", port_code: "NLRTM", address_line1: "Havenweg 4", is_active: true, created_at: nowIso(), updated_at: nowIso() },
  ];
  const consignees = [
    { id: uid(), name: "LA Distribution Hub", country: "USA", city: "Los Angeles", port_code: "USLAX", address_line1: "500 Harbor Blvd", is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Hamburg Warehouse GmbH", country: "Germany", city: "Hamburg", port_code: "DEHAM", address_line1: "Speicherstadt 22", is_active: true, created_at: nowIso(), updated_at: nowIso() },
    { id: uid(), name: "Felixstowe Ltd", country: "UK", city: "Felixstowe", port_code: "GBFXT", address_line1: "Dock Rd 8", is_active: true, created_at: nowIso(), updated_at: nowIso() },
  ];

  const rfq1 = { id: uid(), rfq_number: "RFQ-2026-0001", title: "Q1 Shanghai to LA Ocean FCL", mode: "ocean_fcl", rfq_type: "spot", status: "bidding", auction_status: "live", incoterms: "FOB", contract_duration_months: 3, estimated_annual_volume: "120 x 40HC", bid_deadline: daysFromNow(3), deadline_at: daysFromNow(3), valid_from: nowIso(), valid_to: daysFromNow(90), notes: "Preferred: weekly sailings.", created_at: daysFromNow(-5), updated_at: nowIso() };
  const rfq2 = { id: uid(), rfq_number: "RFQ-2026-0002", title: "Vietnam to Hamburg Contract", mode: "ocean_fcl", rfq_type: "contract", status: "evaluation", auction_status: "closed", incoterms: "CIF", contract_duration_months: 12, estimated_annual_volume: "480 x 40HC", bid_deadline: daysFromNow(-1), deadline_at: daysFromNow(-1), valid_from: nowIso(), valid_to: daysFromNow(365), notes: "12-month contract", created_at: daysFromNow(-14), updated_at: nowIso() };
  const laneA = { id: uid(), rfq_id: rfq1.id, lane_number: 1, origin_city: "Shanghai", origin_country: "China", origin_port_code: "CNSHA", destination_city: "Los Angeles", destination_country: "USA", destination_port_code: "USLAX", equipment_type: "40HC", estimated_volume: "40 units", volume_unit: "container", frequency: "Weekly", is_awarded: false, created_at: nowIso() };
  const laneB = { id: uid(), rfq_id: rfq2.id, lane_number: 1, origin_city: "Ho Chi Minh City", origin_country: "Vietnam", origin_port_code: "VNSGN", destination_city: "Hamburg", destination_country: "Germany", destination_port_code: "DEHAM", equipment_type: "40HC", estimated_volume: "480 units", volume_unit: "container", frequency: "Weekly", is_awarded: true, created_at: nowIso() };
  const quotes = [
    { id: uid(), quote_number: "QUO-2026-0001", rfq_id: rfq1.id, lane_id: laneA.id, carrier_id: carriers[0].id, quote_type: "spot", status: "submitted", version: 1, base_freight_rate: 2450, currency: "USD", rate_unit: "per 40HC", transit_time_days: 18, surcharges: [{ name: "BAF", amount: 180, type: "fixed" }], total_landed_cost: 2630, notes: "", submitted_at: daysFromNow(-2), created_at: daysFromNow(-2), updated_at: nowIso() },
    { id: uid(), quote_number: "QUO-2026-0002", rfq_id: rfq1.id, lane_id: laneA.id, carrier_id: carriers[1].id, quote_type: "spot", status: "submitted", version: 1, base_freight_rate: 2380, currency: "USD", rate_unit: "per 40HC", transit_time_days: 20, surcharges: [{ name: "BAF", amount: 200, type: "fixed" }], total_landed_cost: 2580, notes: "", submitted_at: daysFromNow(-1), created_at: daysFromNow(-1), updated_at: nowIso() },
    { id: uid(), quote_number: "QUO-2026-0003", rfq_id: rfq2.id, lane_id: laneB.id, carrier_id: carriers[2].id, quote_type: "contract", status: "accepted", version: 1, base_freight_rate: 2900, currency: "USD", rate_unit: "per 40HC", transit_time_days: 30, surcharges: [], total_landed_cost: 2900, notes: "", submitted_at: daysFromNow(-3), created_at: daysFromNow(-3), updated_at: nowIso() },
  ];
  const awards = [
    { id: uid(), award_number: "AWD-2026-0001", rfq_id: rfq2.id, lane_id: laneB.id, quote_id: quotes[2].id, carrier_id: carriers[2].id, award_type: "full", allocation_percentage: 100, awarded_rate: 2900, currency: "USD", rationale: "Best total landed cost.", status: "active", is_locked: false, awarded_at: daysFromNow(-1), created_at: daysFromNow(-1), updated_at: nowIso() },
  ];
  const rateCards = [
    { id: uid(), rate_card_number: "RC-2026-0001", rfq_id: rfq2.id, award_id: awards[0].id, carrier_id: carriers[2].id, lane_id: laneB.id, origin: "Ho Chi Minh City, Vietnam", destination: "Hamburg, Germany", mode: "ocean_fcl", equipment_type: "40HC", base_rate: 2900, currency: "USD", rate_unit: "per 40HC", surcharges: [], total_rate: 2900, valid_from: nowIso().slice(0, 10), valid_to: daysFromNow(365).slice(0, 10), is_active: true, status: "active", created_at: nowIso(), updated_at: nowIso() },
  ];
  const orders = [
    { id: uid(), order_number: "ORD-2026-00001", status: "confirmed", order_type: "export", mode: "ocean_fcl", customer_id: customers[0].id, shipper_id: shippers[0].id, consignee_id: consignees[0].id, po_number: "PO-9821", commodity_description: "Electronics", total_value: 148500, risk_level: "low", version: 1, created_at: daysFromNow(-6), updated_at: nowIso() },
    { id: uid(), order_number: "ORD-2026-00002", status: "in_transit", order_type: "import", mode: "ocean_fcl", customer_id: customers[1].id, shipper_id: shippers[1].id, consignee_id: consignees[1].id, po_number: "PO-9822", commodity_description: "Textiles", total_value: 87200, risk_level: "medium", version: 2, created_at: daysFromNow(-11), updated_at: nowIso() },
    { id: uid(), order_number: "ORD-2026-00003", status: "created", order_type: "export", mode: "air", customer_id: customers[2].id, shipper_id: shippers[2].id, consignee_id: consignees[2].id, po_number: "PO-9823", commodity_description: "Chemicals", total_value: 42100, risk_level: "high", version: 1, created_at: daysFromNow(-2), updated_at: nowIso() },
  ];
  const documents = [
    { id: uid(), document_number: "DOC-2026-00001", document_name: "Bill of Lading - ORD-2026-00002", document_type: "bill_of_lading", status: "approved", validation_status: "passed", risk_score: 12, order_id: orders[1].id, is_latest: true, version: 1, created_at: daysFromNow(-4), updated_at: nowIso(), approved_at: daysFromNow(-2) },
    { id: uid(), document_number: "DOC-2026-00002", document_name: "Commercial Invoice - ORD-2026-00002", document_type: "commercial_invoice", status: "pending_review", validation_status: "warning", risk_score: 38, order_id: orders[1].id, is_latest: true, version: 1, created_at: daysFromNow(-3), updated_at: nowIso() },
    { id: uid(), document_number: "DOC-2026-00003", document_name: "Packing List - ORD-2026-00001", document_type: "packing_list", status: "draft", validation_status: null, risk_score: 0, order_id: orders[0].id, is_latest: true, version: 1, created_at: daysFromNow(-1), updated_at: nowIso() },
  ];

  const demoUserId = "demo-user-0000-0000-0000-000000000001";
  const profiles = [
    { id: uid(), user_id: demoUserId, email: "demo@daistrix.com", full_name: "Demo User", role: "buyer", carrier_id: null, is_active: true, created_at: nowIso(), updated_at: nowIso() },
  ];

  return {
    carriers, customers, shippers, consignees,
    rfqs: [rfq1, rfq2],
    rfq_lanes: [laneA, laneB],
    quotes, awards, rate_cards: rateCards,
    orders, documents, profiles,
    bids: [], auction_configs: [], lane_rankings: [], vendor_invitations: [],
    document_versions: [], document_comments: [], document_templates: [],
    order_documents: [], order_shipments: [], order_state_transitions: [],
  };
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const s = seed();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
}
let store: Store = typeof window !== "undefined" ? loadStore() : seed();
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}
export function __resetMockDb() { store = seed(); persist(); }

// select parser
type SelectPart = { kind: "col"; name: string } | { kind: "join"; alias: string; table: string; sub: SelectPart[] };
function splitTopLevel(s: string): string[] {
  const parts: string[] = []; let depth = 0; let buf = "";
  for (const ch of s) {
    if (ch === "(") depth++; else if (ch === ")") depth--;
    if (ch === "," && depth === 0) { if (buf.trim()) parts.push(buf.trim()); buf = ""; }
    else buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}
function parseSelect(s: string): SelectPart[] {
  s = s.replace(/\s+/g, " ").trim();
  return splitTopLevel(s).map((token) => {
    const m = token.match(/^(?:([\w]+):)?([\w]+)\((.+)\)$/);
    if (m) return { kind: "join", alias: m[1] || m[2], table: m[2], sub: parseSelect(m[3]) };
    return { kind: "col", name: token };
  });
}
function singularize(t: string) {
  if (t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.endsWith("s")) return t.slice(0, -1);
  return t;
}
function projectRow(row: Row, parts: SelectPart[], parentTable: string): Row {
  const out: Row = {};
  for (const p of parts) {
    if (p.kind === "col") {
      if (p.name === "*") Object.assign(out, row);
      else out[p.name] = row[p.name];
    } else {
      const target = store[p.table] || [];
      const fkAlias = `${p.alias}_id`;
      const fkTable = `${singularize(p.table)}_id`;
      let value: any = null;
      if (row[fkAlias] !== undefined && row[fkAlias] !== null) {
        const f = target.find((r) => r.id === row[fkAlias]);
        value = f ? projectRow(f, p.sub, p.table) : null;
      } else if (row[fkTable] !== undefined && row[fkTable] !== null) {
        const f = target.find((r) => r.id === row[fkTable]);
        value = f ? projectRow(f, p.sub, p.table) : null;
      } else {
        const parentFk = `${singularize(parentTable)}_id`;
        const children = target.filter((r) => r[parentFk] === row.id);
        value = children.map((c) => projectRow(c, p.sub, p.table));
      }
      out[p.alias] = value;
    }
  }
  return out;
}

type FilterFn = (r: Row) => boolean;

function likeToRegex(pattern: string, insensitive: boolean) {
  const esc = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".");
  return new RegExp("^" + esc + "$", insensitive ? "i" : "");
}

class QueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private op: "select" | "insert" | "update" | "delete" = "select";
  private selectStr = "*";
  private filters: FilterFn[] = [];
  private orderBy: { col: string; asc: boolean } | null = null;
  private limitN: number | null = null;
  private payload: any = null;
  private returnMode: "many" | "single" | "maybe" = "many";
  constructor(private table: string) {}

  select(cols = "*") { if (this.op === "select") this.selectStr = cols; return this; }
  insert(payload: any) { this.op = "insert"; this.payload = payload; return this; }
  update(payload: any) { this.op = "update"; this.payload = payload; return this; }
  delete() { this.op = "delete"; return this; }

  eq(c: string, v: any) { this.filters.push((r) => r[c] === v); return this; }
  neq(c: string, v: any) { this.filters.push((r) => r[c] !== v); return this; }
  gt(c: string, v: any) { this.filters.push((r) => r[c] > v); return this; }
  gte(c: string, v: any) { this.filters.push((r) => r[c] >= v); return this; }
  lt(c: string, v: any) { this.filters.push((r) => r[c] < v); return this; }
  lte(c: string, v: any) { this.filters.push((r) => r[c] <= v); return this; }
  in(c: string, arr: any[]) { this.filters.push((r) => arr.includes(r[c])); return this; }
  is(c: string, v: any) { this.filters.push((r) => r[c] === v); return this; }
  like(c: string, p: string) { const rx = likeToRegex(p, false); this.filters.push((r) => rx.test(String(r[c] ?? ""))); return this; }
  ilike(c: string, p: string) { const rx = likeToRegex(p, true); this.filters.push((r) => rx.test(String(r[c] ?? ""))); return this; }
  or(expr: string) {
    const clauses = splitTopLevel(expr);
    const preds = clauses.map((c) => {
      const m = c.match(/^([\w.]+)\.(ilike|like|eq|neq|gt|gte|lt|lte)\.(.+)$/);
      if (!m) return () => false;
      const [, col, opName, valRaw] = m;
      const val = valRaw.replace(/^"|"$/g, "");
      switch (opName) {
        case "ilike": { const rx = likeToRegex(val, true); return (r: Row) => rx.test(String(r[col] ?? "")); }
        case "like": { const rx = likeToRegex(val, false); return (r: Row) => rx.test(String(r[col] ?? "")); }
        case "eq": return (r: Row) => String(r[col]) === val;
        case "neq": return (r: Row) => String(r[col]) !== val;
        default: return () => false;
      }
    });
    this.filters.push((r) => preds.some((p) => p(r)));
    return this;
  }
  filter(col: string, opName: string, val: any) {
    switch (opName) {
      case "eq": return this.eq(col, val);
      case "gte": return this.gte(col, val);
      case "lte": return this.lte(col, val);
      case "in": return this.in(col, Array.isArray(val) ? val : String(val).split(","));
      default: return this;
    }
  }
  order(col: string, opts?: { ascending?: boolean }) { this.orderBy = { col, asc: opts?.ascending !== false }; return this; }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.limitN = to - from + 1; return this; }
  single() { this.returnMode = "single"; return this; }
  maybeSingle() { this.returnMode = "maybe"; return this; }

  private applyFilters(rows: Row[]): Row[] { return rows.filter((r) => this.filters.every((f) => f(r))); }
  private projectRows(rows: Row[]): Row[] {
    const parts = parseSelect(this.selectStr || "*");
    return rows.map((r) => projectRow(r, parts, this.table));
  }
  private finalize(data: Row[]): { data: any; error: any } {
    if (this.returnMode === "single") {
      if (data.length === 0) return { data: null, error: { code: "PGRST116", message: "No rows found" } };
      return { data: data[0], error: null };
    }
    if (this.returnMode === "maybe") return { data: data[0] ?? null, error: null };
    return { data, error: null };
  }
  private execute(): { data: any; error: any } {
    const table = this.table;
    if (!store[table]) store[table] = [];
    try {
      if (this.op === "insert") {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        const now = nowIso();
        const created = items.map((it) => ({ id: it.id || uid(), created_at: it.created_at || now, updated_at: it.updated_at || now, ...it }));
        created.forEach((r) => { if (!r.id) r.id = uid(); if (!r.created_at) r.created_at = now; });
        store[table].push(...created);
        persist();
        return this.finalize(this.projectRows(created));
      }
      if (this.op === "update") {
        const matched = this.applyFilters(store[table]);
        matched.forEach((r) => { Object.assign(r, this.payload, { updated_at: nowIso() }); });
        persist();
        return this.finalize(this.projectRows(matched));
      }
      if (this.op === "delete") {
        const matched = this.applyFilters(store[table]);
        const ids = new Set(matched.map((r) => r.id));
        store[table] = store[table].filter((r) => !ids.has(r.id));
        persist();
        return this.finalize(this.projectRows(matched));
      }
      let rows = this.applyFilters(store[table]);
      if (this.orderBy) {
        const { col, asc } = this.orderBy;
        rows = [...rows].sort((a, b) => {
          const av = a[col]; const bv = b[col];
          if (av === bv) return 0;
          if (av === undefined || av === null) return 1;
          if (bv === undefined || bv === null) return -1;
          return (av > bv ? 1 : -1) * (asc ? 1 : -1);
        });
      }
      if (this.limitN != null) rows = rows.slice(0, this.limitN);
      return this.finalize(this.projectRows(rows));
    } catch (error: any) {
      return { data: null, error: { message: error?.message ?? "Mock DB error" } };
    }
  }
  then<T1 = any, T2 = never>(onfulfilled?: ((v: { data: any; error: any }) => T1 | PromiseLike<T1>) | null, onrejected?: ((r: any) => T2 | PromiseLike<T2>) | null): PromiseLike<T1 | T2> {
    return Promise.resolve(this.execute()).then(onfulfilled as any, onrejected as any);
  }
}

// ------- RPC generators -------
const pad = (n: number, w = 4) => String(n).padStart(w, "0");
function nextSeq(table: string, prefix: string, field: string, width = 4): string {
  const year = new Date().getFullYear();
  const rows = store[table] || [];
  const key = `${prefix}-${year}-`;
  let max = 0;
  for (const r of rows) {
    const v: string = r[field] || "";
    if (v.startsWith(key)) { const n = parseInt(v.slice(key.length), 10); if (!isNaN(n) && n > max) max = n; }
  }
  return `${key}${pad(max + 1, width)}`;
}
const RPC_MAP: Record<string, () => any> = {
  generate_rfq_number: () => nextSeq("rfqs", "RFQ", "rfq_number"),
  generate_quote_number: () => nextSeq("quotes", "QUO", "quote_number"),
  generate_bid_number: () => {
    const rows = store.bids || []; let max = 0;
    for (const r of rows) { const v: string = r.bid_number || ""; const n = parseInt(v.replace(/^BID/, ""), 10); if (!isNaN(n) && n > max) max = n; }
    return `BID${pad(max + 1, 6)}`;
  },
  generate_award_number: () => nextSeq("awards", "AWD", "award_number"),
  generate_rate_card_number: () => nextSeq("rate_cards", "RC", "rate_card_number"),
  generate_order_number: () => nextSeq("orders", "ORD", "order_number", 5),
  generate_document_number: () => nextSeq("documents", "DOC", "document_number", 5),
};
function rpc(name: string, _args?: any) {
  const fn = RPC_MAP[name];
  return Promise.resolve({ data: fn ? fn() : null, error: null });
}

// ------- Auth -------
export type AuthUser = { id: string; email: string; user_metadata?: any };
export type AuthSession = { user: AuthUser; access_token: string; expires_at: number };
type AuthChangeCb = (event: string, session: AuthSession | null) => void;
const authListeners = new Set<AuthChangeCb>();

function loadSession(): AuthSession | null {
  try { const raw = localStorage.getItem(AUTH_KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return null;
}
function saveSession(s: AuthSession | null) {
  try { if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(AUTH_KEY); } catch { /* ignore */ }
}

let currentSession: AuthSession | null = (() => {
  if (typeof window === "undefined") return null;
  const existing = loadSession();
  if (existing) return existing;
  const demo: AuthSession = {
    user: { id: "demo-user-0000-0000-0000-000000000001", email: "demo@daistrix.com", user_metadata: { full_name: "Demo User", role: "buyer" } },
    access_token: "mock-token",
    expires_at: Math.floor(Date.now() / 1000) + 86400,
  };
  saveSession(demo);
  return demo;
})();

function emitAuth(event: string) {
  authListeners.forEach((cb) => { try { cb(event, currentSession); } catch { /* noop */ } });
}

const auth = {
  onAuthStateChange(cb: AuthChangeCb) {
    authListeners.add(cb);
    setTimeout(() => cb("INITIAL_SESSION", currentSession), 0);
    return { data: { subscription: { unsubscribe() { authListeners.delete(cb); } } } };
  },
  async getSession() { return { data: { session: currentSession }, error: null }; },
  async getUser() { return { data: { user: currentSession?.user ?? null }, error: null }; },
  async signUp({ email, options }: any) {
    const user: AuthUser = { id: uid(), email, user_metadata: options?.data ?? {} };
    currentSession = { user, access_token: "mock-token", expires_at: Math.floor(Date.now() / 1000) + 86400 };
    saveSession(currentSession);
    store.profiles.push({ id: uid(), user_id: user.id, email, full_name: options?.data?.full_name ?? "", role: options?.data?.role ?? "buyer", carrier_id: null, is_active: true, created_at: nowIso(), updated_at: nowIso() });
    persist();
    emitAuth("SIGNED_IN");
    return { data: { user, session: currentSession }, error: null };
  },
  async signInWithPassword({ email }: any) {
    let profile = store.profiles.find((p) => p.email === email);
    if (!profile) {
      profile = { id: uid(), user_id: uid(), email, full_name: email.split("@")[0], role: "buyer", carrier_id: null, is_active: true, created_at: nowIso(), updated_at: nowIso() };
      store.profiles.push(profile); persist();
    }
    const user: AuthUser = { id: profile.user_id, email, user_metadata: { full_name: profile.full_name, role: profile.role } };
    currentSession = { user, access_token: "mock-token", expires_at: Math.floor(Date.now() / 1000) + 86400 };
    saveSession(currentSession);
    emitAuth("SIGNED_IN");
    return { data: { user, session: currentSession }, error: null };
  },
  async signOut() {
    currentSession = null; saveSession(null); emitAuth("SIGNED_OUT");
    return { error: null };
  },
};

// ------- Channels (no-op) -------
function channel(_name: string) {
  const ch: any = {
    on(_evt: string, _opts: any, _cb: any) { return ch; },
    subscribe(_cb?: any) { return ch; },
    unsubscribe() { return Promise.resolve(); },
  };
  return ch;
}
function removeChannel(_ch: any) { return Promise.resolve("ok"); }

// ------- functions.invoke (AI assistant mock) -------
const AI_HELP = `I can help with procurement, tracking, orders, invoices, documents, and shipments. Try: "Which shipments are delayed?", "Create an RFQ from Shanghai to LA", or "Track BL MAEU7728193".`;

function mockAiAssistant(payload: any) {
  const q: string = String(payload?.question ?? "").trim();
  const lower = q.toLowerCase();
  const actions: any[] = [];
  let answer = "";

  const blMatch = q.match(/\b([A-Z]{3,4}\d{6,10}|[A-Z]{2,4}[A-Z0-9]{6,10})\b/);
  if (/\btrack\b|\btracking\b|\bbl\b|\bcontainer\b/i.test(q) && blMatch) {
    const bl = blMatch[1].toUpperCase();
    actions.push({ type: "execute", verb: "global.addShipmentByBl", args: [bl, "mscu"], label: `Track ${bl}` });
    return { answer: `Adding **${bl}** to tracking now.`, actions, clarify: null, pending: null };
  }

  if (/create.*rfq|new rfq|start rfq/i.test(q)) {
    const routeMatch = q.match(/(?:from\s+)?([A-Za-z ]+?)\s*(?:->|to)\s+([A-Za-z ]+)/i);
    if (routeMatch) {
      const origin = routeMatch[1].trim();
      const destination = routeMatch[2].trim();
      actions.push({
        type: "execute", verb: "global.createRfq",
        args: [{
          title: `${origin} -> ${destination}`, mode: "ocean_fcl", rfq_type: "spot",
          lanes: [{ origin_city: origin, origin_country: "Unknown", destination_city: destination, destination_country: "Unknown" }],
        }],
        label: `Create RFQ: ${origin} -> ${destination}`,
      });
      return { answer: `Creating RFQ **${origin} -> ${destination}** (ocean FCL).`, actions, clarify: null, pending: null };
    }
    return {
      answer: "Sure — I need a few details to create the RFQ.",
      actions: [],
      clarify: { questions: [{ slot: "route", prompt: "Which lane? (e.g. Shanghai -> Los Angeles)", chips: [
        { value: "Shanghai -> Los Angeles", label: "Shanghai -> LA" },
        { value: "Ho Chi Minh -> Hamburg", label: "HCM -> Hamburg" },
        { value: "Rotterdam -> New York", label: "RTM -> NYC" },
      ] }] },
      pending: { intent: "createRfq" },
    };
  }

  const ctx = payload?.context ?? {};
  if (/delay|late/i.test(lower)) {
    const delayed = (ctx?.tracking?.shipments ?? []).filter((s: any) => (s.status || "").toLowerCase().includes("delay"));
    answer = delayed.length
      ? `**${delayed.length} shipment${delayed.length > 1 ? "s are" : " is"} delayed.**\n` + delayed.slice(0, 5).map((s: any) => `- ${s.id ?? s.blNumber ?? s.name ?? "shipment"} — ${s.status}`).join("\n")
      : "No delayed shipments right now.";
    return { answer, actions, clarify: null, pending: null };
  }
  if (/how many|count|summary|briefing/i.test(lower)) {
    answer = [`**Daily Briefing**`, `- RFQs: ${(ctx.rfqs ?? []).length}`, `- Quotes: ${(ctx.quotes ?? []).length}`, `- Orders: ${(ctx.orders ?? []).length}`, `- Documents: ${(ctx.documents ?? []).length}`, `- Carriers: ${(ctx.carriers ?? []).length}`, `- Awards: ${(ctx.awards ?? []).length}`].join("\n");
    return { answer, actions, clarify: null, pending: null };
  }

  return { answer: q ? `I received: _${q}_.\n\n${AI_HELP}` : AI_HELP, actions, clarify: null, pending: null };
}

const functions = {
  async invoke(name: string, opts?: { body?: any }) {
    if (name === "ai-assistant") {
      await new Promise((r) => setTimeout(r, 250));
      return { data: mockAiAssistant(opts?.body ?? {}), error: null };
    }
    return { data: null, error: { message: `Unknown function: ${name}` } };
  },
};

export const supabase = {
  from(table: string) { return new QueryBuilder(table); },
  rpc, auth, channel, removeChannel, functions,
};
