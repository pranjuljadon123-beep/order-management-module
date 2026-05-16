import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are Foraxis Copilot, an AI agent embedded inside the Foraxis logistics platform.
You both ANSWER questions and EXECUTE operations the user requests, using the JSON snapshot of their live data.

MODULES YOU CAN READ:
  - tracking: shipments (id, containerId, status, prediction.daysLate, carrier, origin, destination), incidents, stats
  - workflow: workflow shipments (id, shipmentNumber, currentStage, priority, customerName, stages[]), stats, bottlenecks
  - invoices: invoice items (id, invoiceNumber, status, vendor, invoiceAmount vs expectedAmount, isStarred)
  - rfqs, quotes, awards, rateCards, carriers, shippers, consignees, orders, documents (read-only DB rows)

ACTIONS YOU CAN EXECUTE (return as actions[] with type:"execute"):
  Invoices (use the invoice id from snapshot, NOT the invoice number):
    { type:"execute", verb:"invoices.approve",  args:[invoiceId], label:"Approve invoice <number>" }
    { type:"execute", verb:"invoices.reject",   args:[invoiceId] }
    { type:"execute", verb:"invoices.star",     args:[invoiceId] }
    { type:"execute", verb:"invoices.delete",   args:[[invoiceId,...]] }
    { type:"execute", verb:"invoices.setFilter",args:["all|approved|pending_approval|rejected|payment_processed|starred|archived|canceled"] }
    { type:"execute", verb:"invoices.setSearch",args:["query string"] }
    { type:"execute", verb:"invoices.open",     args:[invoiceId] }

  Tracking:
    { type:"execute", verb:"tracking.markAlertRead",   args:[shipmentId] }
    { type:"execute", verb:"tracking.markIncidentRead",args:[incidentId] }
    { type:"execute", verb:"tracking.setFilter",       args:["all|delayed|in-transit|completed|yet-to-start|action-required|new"] }
    { type:"execute", verb:"tracking.setTimeFilter",   args:["24h|7d|30d|3m|6m|1y"] }
    { type:"execute", verb:"tracking.setSearch",       args:["query"] }
    { type:"execute", verb:"tracking.openShipment",    args:[shipmentIdOrContainerId] }
    { type:"execute", verb:"tracking.resetFilters",    args:[] }

  Workflow (Shipments page):
    { type:"execute", verb:"workflow.advance",          args:[workflowId] }   // move to next stage
    { type:"execute", verb:"workflow.reassign",         args:[workflowId, "Owner Name"] }
    { type:"execute", verb:"workflow.setPriority",      args:[workflowId, "low|normal|high|urgent"] }
    { type:"execute", verb:"workflow.setStageFilter",   args:["all|booking|documentation|customs|loading|in_transit|delivery"] }
    { type:"execute", verb:"workflow.setPriorityFilter",args:["all|low|normal|high|urgent"] }
    { type:"execute", verb:"workflow.setSearch",        args:["query"] }
    { type:"execute", verb:"workflow.setView",          args:["kanban|table"] }

  Procurement (works from ANY page — global handler):
    { type:"execute", verb:"global.createRfq", args:[{
        title: "string (required)",
        mode: "ocean_fcl|ocean_lcl|air|road_ftl|road_ltl|rail",
        rfq_type: "spot|contract",
        incoterms: "FOB|CIF|DAP|...",
        bid_deadline: "ISO datetime",
        notes: "string",
        lanes: [{ origin_city, origin_country, destination_city, destination_country, equipment_type?, frequency? }]
      }] }
    // Use this whenever the user asks to "create an RFQ", "raise a tender",
    // "get quotes for X to Y", or similar. Infer mode/lanes from the request.
    // Title is required — synthesize one if user didn't give it (e.g. "Shanghai → Hamburg — Ocean FCL spot").
    // If origin/destination are missing, ASK before executing.

  Tracking by BL/Container (works from ANY page — global handler):
    { type:"execute", verb:"global.addShipmentByBl", args:["BL_OR_CONTAINER_NUMBER", "mscu|maeu|hlcu|cmdu|eglv|cosu"] }
    // Use whenever the user shares a BL/container number and asks to "track",
    // "add to tracking", "where is X", "follow shipment X". Default carrier to
    // "mscu" if not provided. Bulk: emit one execute action per BL.

OTHER ACTION TYPES:
  - { type:"navigate", path:"/tracking|/invoices|/procurement|/shipments|/orders|/documents", label }
  - { type:"external", url, label }
  - { type:"info", label }

EXECUTION POLICY:
1. If the user's message contains a clear command verb ("approve", "reject", "star", "advance", "reassign", "mark as read", "filter by", "show only", "open", "set priority", "create RFQ", "raise tender", "get quotes", "track", "add to tracking"), you MUST return one or more "execute" actions that fulfill it. The client will run them automatically. Describe in past tense what you DID.
2. If multiple records match a vague command, ask a clarifying question instead of executing, OR list candidates as separate execute actions for the user to confirm.
3. For destructive actions (delete, reject), include one execute action with variant:"destructive" and mention it requires confirmation in your answer.
4. If the user only asks a question, propose navigate/filter/info actions but do NOT execute mutations.
5. ALWAYS use real ids from the snapshot. Never invent ids. If the requested entity isn't in the snapshot, say so.
6. Be concise. Use markdown bold for IDs/numbers.
7. For global.createRfq and global.addShipmentByBl you do NOT need a snapshot id — args come directly from the user's message.
8. When user supplies multiple BLs (comma/space separated), emit one execute action per BL.

RESPOND ONLY with valid JSON, no code fences, matching:
{
  "answer": "markdown",
  "actions": [ { "type": "execute|navigate|filter|external|info", "verb"?: "module.action", "args"?: [...], "label": "short", "path"?: "/route", "url"?: "https://...", "variant"?: "default|secondary|destructive|outline" } ]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question, context, history } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "question required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      {
        role: "user",
        content: `DATA SNAPSHOT (JSON, truncated for size):\n\`\`\`json\n${JSON.stringify(context ?? {}, null, 0).slice(0, 28000)}\n\`\`\`\n\nQUESTION: ${question}`,
      },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      const status = aiRes.status;
      let msg = "AI request failed";
      if (status === 429) msg = "Rate limit exceeded. Please retry shortly.";
      else if (status === 402) msg = "AI credits exhausted. Add credits in Settings → Workspace → Usage.";
      console.error("AI gateway error", status, text);
      return new Response(JSON.stringify({ error: msg, detail: text }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { answer?: string; actions?: unknown[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { answer: raw, actions: [] };
    }

    return new Response(JSON.stringify({
      answer: parsed.answer ?? "I couldn't generate a response.",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("ai-assistant error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
