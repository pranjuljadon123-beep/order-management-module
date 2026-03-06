import { AlertTriangle, Clock, Flame, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStatsProps {
  stats: {
    total: number;
    breached: number;
    atRisk: number;
    urgent: number;
  };
}

const cards = [
  { key: "total", label: "Total Shipments", icon: Package, color: "text-primary", bg: "bg-primary/10" },
  { key: "breached", label: "SLA Breached", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  { key: "atRisk", label: "At Risk", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  { key: "urgent", label: "Urgent Priority", icon: Flame, color: "text-destructive", bg: "bg-destructive/10" },
] as const;

export function WorkflowStats({ stats }: WorkflowStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => {
        const Icon = c.icon;
        const value = stats[c.key];
        return (
          <div key={c.key} className="kpi-card flex items-center gap-4">
            <div className={cn("flex items-center justify-center h-11 w-11 rounded-xl", c.bg)}>
              <Icon className={cn("h-5 w-5", c.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
