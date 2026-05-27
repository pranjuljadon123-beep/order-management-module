import { useEffect } from "react";

/**
 * Publishes a module-scoped data snapshot and optional action handlers to
 * window.__daistrixCtx so the AiAssistant can read state and execute mutations
 * across modules without prop-drilling.
 */
export type AiActionHandlers = Record<string, (...args: any[]) => any>;

export function useAiContext(
  key: "tracking" | "workflow" | "invoices" | "global" | "procurement",
  value: unknown,
  actions?: AiActionHandlers,
) {
  useEffect(() => {
    const w = window as any;
    w.__daistrixCtx = w.__daistrixCtx ?? {};
    w.__daistrixCtx[key] = value;
    w.__daistrixActions = w.__daistrixActions ?? {};
    if (actions) w.__daistrixActions[key] = actions;
    return () => {
      if (w.__daistrixCtx) delete w.__daistrixCtx[key];
      if (w.__daistrixActions) delete w.__daistrixActions[key];
    };
  }, [key, value, actions]);
}
