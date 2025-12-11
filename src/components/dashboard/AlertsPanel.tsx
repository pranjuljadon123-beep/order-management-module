import { AlertTriangle, Clock, FileWarning, Ship, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const alerts = [
  {
    id: 1,
    type: "delay",
    title: "Shipment Delay Alert",
    message: "SHP-2024-003 delayed by 2 days due to port congestion in Mumbai",
    time: "2 hours ago",
    severity: "warning",
    icon: Clock,
  },
  {
    id: 2,
    type: "document",
    title: "Missing Documentation",
    message: "Bill of Lading missing for SHP-2024-007 - required for customs",
    time: "4 hours ago",
    severity: "error",
    icon: FileWarning,
  },
  {
    id: 3,
    type: "risk",
    title: "Weather Advisory",
    message: "Storm warning in South China Sea may affect ocean routes",
    time: "6 hours ago",
    severity: "warning",
    icon: AlertTriangle,
  },
  {
    id: 4,
    type: "arrival",
    title: "Shipment Arrived",
    message: "SHP-2024-002 successfully delivered to Singapore warehouse",
    time: "8 hours ago",
    severity: "success",
    icon: CheckCircle2,
  },
  {
    id: 5,
    type: "vessel",
    title: "Vessel Schedule Change",
    message: "MSC Aurora departure rescheduled to Dec 15 from Rotterdam",
    time: "12 hours ago",
    severity: "info",
    icon: Ship,
  },
];

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "error":
      return {
        bg: "bg-destructive/10",
        border: "border-destructive/30",
        icon: "text-destructive",
        dot: "bg-destructive",
      };
    case "warning":
      return {
        bg: "bg-warning/10",
        border: "border-warning/30",
        icon: "text-warning",
        dot: "bg-warning",
      };
    case "success":
      return {
        bg: "bg-success/10",
        border: "border-success/30",
        icon: "text-success",
        dot: "bg-success",
      };
    default:
      return {
        bg: "bg-info/10",
        border: "border-info/30",
        icon: "text-info",
        dot: "bg-info",
      };
  }
};

export function AlertsPanel() {
  return (
    <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div>
          <h3 className="font-semibold text-foreground">Smart Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Real-time notifications & exceptions
          </p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
          {alerts.filter((a) => a.severity === "error" || a.severity === "warning").length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border/50">
          {alerts.map((alert, index) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = alert.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex gap-4 p-4 transition-colors hover:bg-muted/30 animate-fade-in cursor-pointer",
                  styles.bg
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    styles.border,
                    styles.icon
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground truncate">
                      {alert.title}
                    </h4>
                    <span
                      className={cn("h-2 w-2 shrink-0 rounded-full mt-2", styles.dot)}
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    {alert.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/50 p-4">
        <Button variant="outline" className="w-full">
          View All Alerts
        </Button>
      </div>
    </div>
  );
}
