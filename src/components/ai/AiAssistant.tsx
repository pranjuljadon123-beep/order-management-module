import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, ExternalLink, ArrowRight, X, Wand2, CheckCircle2, AlertCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AiAction = {
  type: "navigate" | "filter" | "external" | "info" | "execute";
  label: string;
  path?: string;
  url?: string;
  filterKey?: string;
  value?: string;
  verb?: string;
  args?: any[];
  variant?: "default" | "secondary" | "destructive" | "outline";
};

type ExecResult = { ok: boolean; label: string; error?: string };

type AiMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: AiAction[];
  executed?: ExecResult[];
};

const SUGGESTED_QUESTIONS = [
  "Which shipments are delayed and why?",
  "Approve all invoices from DSV Demo Distributor",
  "Advance SHP-2026-003 to the next stage",
  "Reassign current stage of SHP-2026-007 to Priya Sharma",
  "Filter tracking to show only delayed shipments",
  "Reject invoice 5 — amount exceeds expected",
  "Give me a daily operations briefing",
  "Which workflow stages have SLA breaches and who owns them?",
];

function executeVerb(verb: string, args: any[]): { ok: boolean; error?: string } {
  try {
    const [modKey, action] = verb.split(".");
    const w = window as any;
    const handlers = w.__foraxisActions?.[modKey];
    if (!handlers || typeof handlers[action] !== "function") {
      return { ok: false, error: `Module "${modKey}" not active. Open the ${modKey} page first.` };
    }
    handlers[action](...(args ?? []));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Execution failed" };
  }
}

async function gatherContext(): Promise<Record<string, unknown>> {
  // Pull a compact snapshot. Each list capped to keep prompt size sane.
  const cap = <T,>(arr: T[] | null | undefined, n = 25) => (arr ?? []).slice(0, n);

  const [rfqsRes, quotesRes, ordersRes, docsRes, carriersRes, rateCardsRes, awardsRes] = await Promise.all([
    supabase.from("rfqs").select("id, rfq_number, title, status, mode, created_at, deadline_at").order("created_at", { ascending: false }).limit(25),
    supabase.from("quotes").select("id, rfq_id, carrier_id, total_landed_cost, status, version, submitted_at").order("submitted_at", { ascending: false }).limit(30),
    supabase.from("orders").select("id, order_number, status, customer_id, mode, created_at, total_value").order("created_at", { ascending: false }).limit(25),
    supabase.from("documents").select("id, document_number, document_type, status, created_at").order("created_at", { ascending: false }).limit(25),
    supabase.from("carriers").select("id, name, code, scac, mode").limit(30),
    supabase.from("rate_cards").select("id, rate_card_number, carrier_id, status, valid_from, valid_to").limit(20),
    supabase.from("awards").select("id, award_number, rfq_id, lane_id, carrier_id, status").order("created_at", { ascending: false }).limit(20),
  ]);

  // Pull tracking + workflow snapshots from window (set by hooks)
  const tracking = (window as any).__foraxisCtx?.tracking ?? null;
  const workflow = (window as any).__foraxisCtx?.workflow ?? null;
  const invoices = (window as any).__foraxisCtx?.invoices ?? null;

  return {
    generatedAt: new Date().toISOString(),
    tracking: tracking ? { shipments: cap(tracking.shipments, 30), incidents: cap(tracking.incidents, 10), stats: tracking.stats } : null,
    workflow: workflow ? { shipments: cap(workflow.shipments, 30), stats: workflow.stats, bottlenecks: workflow.bottlenecks } : null,
    invoices: invoices ? { items: cap(invoices, 40) } : null,
    rfqs: cap(rfqsRes.data),
    quotes: cap(quotesRes.data, 30),
    orders: cap(ordersRes.data),
    documents: cap(docsRes.data),
    carriers: cap(carriersRes.data, 30),
    rateCards: cap(rateCardsRes.data),
    awards: cap(awardsRes.data),
  };
}

function renderMarkdown(text: string): string {
  // Lightweight markdown: bold, lists, line breaks
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, "<br/>");
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    const userMsg: AiMessage = { role: "user", content: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const context = await gatherContext();
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { question, context, history },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const acts: AiAction[] = Array.isArray(data?.actions) ? data.actions : [];
      // Auto-execute non-destructive execute actions immediately
      const autoRun = acts.filter((a) => a.type === "execute" && a.variant !== "destructive" && a.verb);
      const executed: ExecResult[] = autoRun.map((a) => {
        const res = executeVerb(a.verb!, a.args ?? []);
        return { ok: res.ok, label: a.label, error: res.error };
      });
      setMessages((m) => [...m, {
        role: "assistant",
        content: data?.answer ?? "No response.",
        actions: acts,
        executed,
      }]);
      if (executed.length) {
        const okCount = executed.filter((e) => e.ok).length;
        const failCount = executed.length - okCount;
        if (okCount) toast.success(`Executed ${okCount} action${okCount > 1 ? "s" : ""}`);
        if (failCount) toast.error(`${failCount} action${failCount > 1 ? "s" : ""} failed`);
      }
    } catch (e: any) {
      const msg = e?.message ?? "Something went wrong";
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}`, actions: [] }]);
      toast.error("AI assistant error", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  function runAction(a: AiAction) {
    if (a.type === "external" && a.url) {
      window.open(a.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (a.type === "navigate" && a.path) {
      navigate(a.path);
      setOpen(false);
      return;
    }
    if (a.type === "filter" && a.path) {
      const params = new URLSearchParams();
      if (a.filterKey) params.set(a.filterKey, a.value ?? "");
      navigate(`${a.path}${params.toString() ? `?${params}` : ""}`);
      setOpen(false);
      toast.info(`Applied filter: ${a.filterKey}=${a.value}`);
      return;
    }
    if (a.type === "execute" && a.verb) {
      const res = executeVerb(a.verb, a.args ?? []);
      if (res.ok) toast.success(a.label);
      else toast.error(`Failed: ${a.label}`, { description: res.error });
      return;
    }
    if (a.type === "info") toast.info(a.label);
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 group flex items-center gap-2 rounded-full",
          "bg-gradient-to-r from-primary to-accent text-primary-foreground",
          "px-5 py-3 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
          "transition-all hover:scale-105 active:scale-95"
        )}
        aria-label="Open Foraxis AI assistant"
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium text-sm hidden sm:inline">Ask Foraxis AI</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              Foraxis Copilot
              <Badge variant="secondary" className="ml-1 text-[10px]">Beta</Badge>
            </SheetTitle>
            <SheetDescription className="text-xs">
              Ask about shipments, invoices, RFQs, documents, vendors or operations across your data.
            </SheetDescription>
          </SheetHeader>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium mb-1">👋 Hi, I'm your operations copilot.</p>
                  <p className="text-xs text-muted-foreground">
                    I have visibility across tracking, workflow, procurement, invoices, orders and documents. Try one of these:
                  </p>
                </div>
                <div className="grid gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="text-left text-sm px-3 py-2 rounded-md border border-border hover:bg-accent/10 hover:border-accent/40 transition-colors flex items-start gap-2"
                    >
                      <Wand2 className="h-3.5 w-3.5 mt-0.5 text-accent flex-shrink-0" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[90%]", m.role === "user" ? "ml-auto" : "")}>
                    {m.role === "user" ? (
                      <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2 text-sm">
                        {m.content}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          className="text-sm leading-relaxed prose-sm"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                        />
                        {m.actions && m.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {m.actions.map((a, j) => (
                              <Button
                                key={j}
                                size="sm"
                                variant={a.variant ?? "outline"}
                                onClick={() => runAction(a)}
                                className="gap-1.5 h-8"
                              >
                                {a.type === "external" ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                                {a.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing your operational data…
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border p-3 bg-background">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
                placeholder="Ask anything about your shipments, invoices, vendors…"
                className="min-h-[60px] max-h-32 pr-12 resize-none"
                disabled={loading}
              />
              <Button
                size="icon"
                onClick={() => ask(input)}
                disabled={loading || !input.trim()}
                className="absolute bottom-2 right-2 h-8 w-8"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[11px] text-muted-foreground">Press Enter to send · Shift+Enter for new line</span>
                <button
                  onClick={() => setMessages([])}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear chat
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
