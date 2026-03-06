import { STAGES, type WorkflowStage } from "@/hooks/useShipmentWorkflow";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottleneckBarProps {
  bottlenecks: Record<WorkflowStage, number>;
  total: number;
}

export function BottleneckBar({ bottlenecks, total }: BottleneckBarProps) {
  const hasIssues = Object.values(bottlenecks).some(v => v > 0);
  if (!hasIssues) return null;

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold text-foreground">Bottleneck Analysis</h3>
        <span className="text-xs text-muted-foreground">— stages with SLA warnings or breaches</span>
      </div>
      <div className="flex items-end gap-2 h-16">
        {STAGES.map(stage => {
          const count = bottlenecks[stage.key];
          const heightPct = total > 0 ? Math.max(8, (count / total) * 100) : 8;
          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center gap-1">
              <span className={cn(
                "text-xs font-bold",
                count > 0 ? "text-warning" : "text-muted-foreground/50"
              )}>
                {count > 0 ? count : ""}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  count > 0 ? "bg-warning/70" : "bg-border/50"
                )}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {stage.icon}<br />{stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
