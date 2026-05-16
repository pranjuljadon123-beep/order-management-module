import { useEffect } from "react";

/**
 * Publishes a module-scoped data snapshot and optional action handlers to
 * window.__foraxisCtx so the AiAssistant can read state and execute mutations
 * across modules without prop-drilling.
 */
export type AiActionHandlers = Record<string, (...args: any[]) => any>;

export function useAiContext(
  key: "tracking" | "workflow" | "invoices",
  value: unknown,
  actions?: AiActionHandlers,
) {
  useEffect(() => {
    const w = window as any;
    w.__foraxisCtx = w.__foraxisCtx ?? {};
    w.__foraxisCtx[key] = value;
    w.__foraxisActions = w.__foraxisActions ?? {};
    if (actions) w.__foraxisActions[key] = actions;
    return () => {
      if (w.__foraxisCtx) delete w.__foraxisCtx[key];
      if (w.__foraxisActions) delete w.__foraxisActions[key];
    };
  }, [key, value, actions]);
}
