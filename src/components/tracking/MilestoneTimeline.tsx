import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  Ship,
  Package,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Shipment } from "@/hooks/useTracking";

export interface Milestone {
  id: string;
  name: string;
  location: string;
  locationDetail?: string;
  plannedDate: string;
  actualDate?: string;
  status: "completed" | "current" | "delayed" | "pending";
  icon: "pickup" | "warehouse" | "ship" | "truck" | "delivery";
  source?: "AIS" | "Carrier" | "Terminal";
  notes?: string;
}

interface MilestoneTimelineProps {
  shipment: Shipment;
  milestones: Milestone[];
}

const iconMap = {
  pickup: Package,
  warehouse: Warehouse,
  ship: Ship,
  truck: Truck,
  delivery: MapPin,
};

export function MilestoneTimeline({ shipment, milestones }: MilestoneTimelineProps) {
  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "current":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
            <CheckCircle2 className="h-5 w-5 text-primary relative" />
          </div>
        );
      case "delayed":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "pending":
        return <Circle className="h-5 w-5 text-muted-foreground/50" />;
    }
  };

  const getStatusColor = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "current":
        return "bg-primary";
      case "delayed":
        return "bg-amber-500";
      case "pending":
        return "bg-muted-foreground/30";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Shipment Milestones</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tracking {shipment.containerId}
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {milestones.map((milestone, index) => {
            const IconComponent = iconMap[milestone.icon];
            const isLast = index === milestones.length - 1;
            
            return (
              <div key={milestone.id} className="relative">
                {/* Connecting line */}
                {!isLast && (
                  <div 
                    className={cn(
                      "absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-16px)]",
                      milestone.status === "completed" || milestone.status === "current" 
                        ? getStatusColor(milestone.status)
                        : "bg-border"
                    )}
                  />
                )}

                <div 
                  className={cn(
                    "flex gap-4 p-3 rounded-xl transition-all duration-200",
                    milestone.status === "current" && "bg-primary/5 border border-primary/20 shadow-sm",
                    milestone.status === "delayed" && "bg-amber-500/5 border border-amber-500/20"
                  )}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      milestone.status === "completed" && "bg-green-100 dark:bg-green-900/30",
                      milestone.status === "current" && "bg-primary/10",
                      milestone.status === "delayed" && "bg-amber-100 dark:bg-amber-900/30",
                      milestone.status === "pending" && "bg-muted"
                    )}>
                      {getStatusIcon(milestone.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={cn(
                          "font-medium text-sm",
                          milestone.status === "pending" ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {milestone.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {milestone.location}
                        </p>
                        {milestone.locationDetail && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {milestone.locationDetail}
                          </p>
                        )}
                      </div>
                      {milestone.source && (
                        <Badge variant="secondary" className="text-[10px] h-5 flex-shrink-0">
                          {milestone.source}
                        </Badge>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Planned:</span>
                        <span className="font-medium text-foreground">{milestone.plannedDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className={cn(
                          "font-medium",
                          milestone.actualDate 
                            ? milestone.status === "delayed" 
                              ? "text-amber-600" 
                              : "text-green-600"
                            : "text-muted-foreground"
                        )}>
                          {milestone.actualDate || "--"}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {milestone.notes && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
                        {milestone.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Data Sources Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Data sources: AIS, Carrier API, Terminal</span>
          <span>Last sync: 2 min ago</span>
        </div>
      </div>
    </div>
  );
}
