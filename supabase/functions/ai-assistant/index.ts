import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are Foraxis Copilot, an AI assistant embedded inside the Foraxis logistics platform.
You answer operational questions for a logistics/supply-chain user based ONLY on the JSON snapshot of their data provided in the user message.
You have visibility across these modules:
  - tracking: live ocean/air shipments (containers, ETA, delays, carrier)
  - workflow: shipment workflow stages (Booking → Documentation → Customs → Loading → In-Transit → Delivery) with SLA tracking and owners
  - invoices: vendor invoices with status, amounts, variances vs expected
  - rfqs: procurement Request-for-Quotes and quotes from carriers
  - orders: customer orders
  - documents: shipping documents (BL, invoices, packing lists, etc.)
  - rateCards, carriers, shippers, consignees: master data

RULES:
1. Be concise and operational. Use markdown lists, bold key numbers, mention IDs/container numbers/RFQ numbers explicitly.
2. NEVER invent data. If the snapshot doesn't contain the answer, say so and suggest what they could do.
3. Always think about WHAT THE USER CAN DO NEXT and propose 1-5 ACTION buttons.
4. Action types:
   - "navigate": jumps to a route inside the app (path like "/tracking", "/invoices", "/procurement", "/shipments", "/orders", "/documents")
   - "filter": navigate + apply a filter (filterKey is one of: status, search, vendor, carrier, mode, stage); pass a "value" string.
   - "external": open external URL
   - "info": informational only
5. Prefer specific actions: "View delayed shipment TRHU6873407" → navigate with deeplink intent, label that's specific, not generic.
6. If user asks for analytics/stats, compute them yourself from the snapshot.

RESPOND ONLY with valid JSON matching this exact schema:
{
  "answer": "markdown string",
  "actions": [
    { "type": "navigate" | "filter" | "external" | "info", "label": "short button text", "path"?: "/route", "url"?: "https://...", "filterKey"?: "status|search|vendor|carrier|mode|stage", "value"?: "string", "variant"?: "default" | "secondary" | "destructive" | "outline" }
  ]
}
No prose outside the JSON. No code fences.`;

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
