import { STAGES, type ShipmentWorkflow, type WorkflowStage, getTimeInStage, getSlaStatus } from "@/hooks/useShipmentWorkflow";
import { Badge } from "@/components/ui/badge";
import { Ship, Plane, Truck, Clock, User, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkflowKanbanProps {
  stageGroups: Record<WorkflowStage, ShipmentWorkflow[]>;
  bottlenecks: Record<WorkflowStage, number>;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-white",
  normal: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

const modeIcon = (mode: string) => {
  if (mode === "air") return Plane;
  if (mode === "road") return Truck;
  return Ship;
};

function ShipmentCard({ workflow }: { workflow: ShipmentWorkflow }) {
  const currentStage = workflow.stages.find(s => s.isCurrent);
  const timeInfo = getTimeInStage(currentStage?.enteredAt || null);
  const slaStatus = currentStage ? getSlaStatus(timeInfo.hours, currentStage.slaHours) : "on-track";
  const ModeIcon = modeIcon(workflow.mode);

  return (
    <div className={cn(
      "bg-card border rounded-lg p-3.5 cursor-pointer hover:shadow-md transition-all group",
      slaStatus === "breached" ? "border-destructive/50 bg-destructive/5" :
      slaStatus === "warning" ? "border-warning/50 bg-warning/5" :
      "border-border hover:border-primary/40"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-semibold text-foreground">{workflow.shipmentNumber}</span>
        <Badge className={cn("text-[10px] px-1.5 py-0", priorityColors[workflow.priority])}>
          {workflow.priority.toUpperCase()}
        </Badge>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground truncate mb-2">{workflow.title}</p>

      {/* Route */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <ModeIcon className="h-3 w-3 shrink-0" />
        <span className="truncate">{workflow.originCity} → {workflow.destinationCity}</span>
      </div>

      {/* Owner & Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{currentStage?.ownerName || "Unassigned"}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          slaStatus === "breached" ? "text-destructive" :
          slaStatus === "warning" ? "text-warning" : "text-muted-foreground"
        )}>
          {slaStatus !== "on-track" && <AlertTriangle className="h-3 w-3" />}
          <Clock className="h-3 w-3" />
          {timeInfo.label}
        </div>
      </div>

      {/* SLA Progress bar */}
      {currentStage && currentStage.enteredAt && (
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                slaStatus === "breached" ? "bg-destructive" :
                slaStatus === "warning" ? "bg-warning" : "bg-primary"
              )}
              style={{ width: `${Math.min(100, (timeInfo.hours / currentStage.slaHours) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {timeInfo.label} / {currentStage.slaHours}h SLA
          </p>
        </div>
      )}
    </div>
  );
}

export function WorkflowKanban({ stageGroups, bottlenecks }: WorkflowKanbanProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STAGES.map(stage => {
        const items = stageGroups[stage.key];
        const hasBottleneck = bottlenecks[stage.key] > 0;
        return (
          <div
            key={stage.key}
            className={cn(
              "flex-shrink-0 w-[280px] rounded-xl border bg-muted/30",
              hasBottleneck ? "border-warning/40" : "border-border/50"
            )}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{stage.icon}</span>
                  <h4 className="text-sm font-semibold text-foreground">{stage.label}</h4>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              {hasBottleneck && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-warning font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  {bottlenecks[stage.key]} shipment{bottlenecks[stage.key] > 1 ? "s" : ""} at risk
                </div>
              )}
            </div>

            {/* Cards */}
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="p-2 space-y-2">
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No shipments</p>
                )}
                {items.map(w => (
                  <ShipmentCard key={w.id} workflow={w} />
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
