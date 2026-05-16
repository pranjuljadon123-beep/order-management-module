import { useEffect } from "react";

/**
 * Publishes a module-scoped data snapshot to window.__foraxisCtx so the
 * AiAssistant can include it as context when calling the AI edge function.
 * Snapshots are intentionally global (not React state) to avoid forcing
 * every consumer page to thread props down to a portal-rendered panel.
 */
export function useAiContext(key: "tracking" | "workflow" | "invoices", value: unknown) {
  useEffect(() => {
    const w = window as any;
    w.__foraxisCtx = w.__foraxisCtx ?? {};
    w.__foraxisCtx[key] = value;
    return () => {
      if (w.__foraxisCtx) delete w.__foraxisCtx[key];
    };
  }, [key, value]);
}
