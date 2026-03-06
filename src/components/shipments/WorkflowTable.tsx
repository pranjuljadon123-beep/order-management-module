import { type ShipmentWorkflow, STAGES, getTimeInStage, getSlaStatus } from "@/hooks/useShipmentWorkflow";
import { Badge } from "@/components/ui/badge";
import { Ship, Plane, Truck, AlertTriangle, Clock, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowTableProps {
  workflows: ShipmentWorkflow[];
}

const priorityConfig: Record<string, { label: string; class: string }> = {
  urgent: { label: "URGENT", class: "bg-destructive text-destructive-foreground" },
  high: { label: "HIGH", class: "bg-warning text-white" },
  normal: { label: "NORMAL", class: "bg-primary/10 text-primary" },
  low: { label: "LOW", class: "bg-muted text-muted-foreground" },
};

const stageLabels: Record<string, string> = {
  booking: "Booking", documentation: "Documentation", customs: "Customs",
  loading: "Loading", in_transit: "In Transit", delivery: "Delivery",
};

const modeIcon = (mode: string) => {
  if (mode === "air") return Plane;
  if (mode === "road") return Truck;
  return Ship;
};

export function WorkflowTable({ workflows }: WorkflowTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="bg-muted/30">
              <th>Shipment</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Current Stage</th>
              <th>Owner</th>
              <th>Time in Stage</th>
              <th>SLA Status</th>
              <th>Priority</th>
              <th>Progress</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((w, idx) => {
              const currentStage = w.stages.find(s => s.isCurrent);
              const timeInfo = getTimeInStage(currentStage?.enteredAt || null);
              const slaStatus = currentStage ? getSlaStatus(timeInfo.hours, currentStage.slaHours) : "on-track";
              const ModeIcon = modeIcon(w.mode);
              const stageIdx = STAGES.findIndex(s => s.key === w.currentStage);
              const pConfig = priorityConfig[w.priority];

              return (
                <tr
                  key={w.id}
                  className={cn(
                    "animate-fade-in cursor-pointer",
                    slaStatus === "breached" && "bg-destructive/5"
                  )}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <td>
                    <div>
                      <span className="font-mono font-semibold text-foreground text-sm">{w.shipmentNumber}</span>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{w.title}</p>
                    </div>
                  </td>
                  <td className="text-foreground text-sm">{w.customerName}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <ModeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="text-sm">
                        <span className="text-foreground">{w.originCity}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-foreground">{w.destinationCity}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="outline" className="text-xs font-medium">
                      {STAGES.find(s => s.key === w.currentStage)?.icon} {stageLabels[w.currentStage]}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-foreground">{currentStage?.ownerName || "—"}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {currentStage?.ownerRole.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      slaStatus === "breached" ? "text-destructive" :
                      slaStatus === "warning" ? "text-warning" : "text-foreground"
                    )}>
                      <Clock className="h-3.5 w-3.5" />
                      {timeInfo.label}
                    </div>
                    {currentStage && (
                      <span className="text-[10px] text-muted-foreground">
                        / {currentStage.slaHours}h SLA
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        slaStatus === "breached" ? "bg-destructive/10 text-destructive" :
                        slaStatus === "warning" ? "bg-warning/10 text-warning" :
                        "bg-success-light text-success"
                      )}>
                        {slaStatus === "breached" && <AlertTriangle className="h-3 w-3" />}
                        {slaStatus === "warning" && <AlertTriangle className="h-3 w-3" />}
                        {slaStatus === "breached" ? "Breached" :
                         slaStatus === "warning" ? "At Risk" : "On Track"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge className={cn("text-[10px]", pConfig.class)}>
                      {pConfig.label}
                    </Badge>
                  </td>
                  <td>
                    {/* Mini stage progress */}
                    <div className="flex items-center gap-1">
                      {STAGES.map((s, i) => (
                        <div
                          key={s.key}
                          className={cn(
                            "h-2 w-5 rounded-sm",
                            i < stageIdx ? "bg-primary" :
                            i === stageIdx ? (slaStatus === "breached" ? "bg-destructive" : slaStatus === "warning" ? "bg-warning" : "bg-primary/60") :
                            "bg-border"
                          )}
                          title={s.label}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
