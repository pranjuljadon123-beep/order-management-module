import { 
  ShoppingCart, 
  Truck, 
  Package, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ModuleStatus {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "healthy" | "warning" | "critical";
  metrics: {
    label: string;
    value: string | number;
    subLabel?: string;
  }[];
  alerts: number;
  lastUpdated: string;
}

const moduleStatuses: ModuleStatus[] = [
  {
    id: "procurement",
    name: "Procurement",
    path: "/procurement",
    icon: ShoppingCart,
    status: "healthy",
    metrics: [
      { label: "Active RFQs", value: 8, subLabel: "3 closing today" },
      { label: "Pending Quotes", value: 24 },
      { label: "Awarded", value: "$1.2M", subLabel: "This month" },
    ],
    alerts: 2,
    lastUpdated: "2 min ago",
  },
  {
    id: "shipments",
    name: "Shipments",
    path: "/shipments",
    icon: Truck,
    status: "warning",
    metrics: [
      { label: "Active", value: 156 },
      { label: "In Transit", value: 89, subLabel: "12 delayed" },
      { label: "Arriving Today", value: 8 },
    ],
    alerts: 12,
    lastUpdated: "Just now",
  },
  {
    id: "tracking",
    name: "Tracking",
    path: "/tracking",
    icon: Package,
    status: "critical",
    metrics: [
      { label: "Containers", value: 423 },
      { label: "Exceptions", value: 18, subLabel: "Action required" },
      { label: "On-Time %", value: "87%", subLabel: "Below target" },
    ],
    alerts: 18,
    lastUpdated: "1 min ago",
  },
  {
    id: "documents",
    name: "Documents",
    path: "/documents",
    icon: FileText,
    status: "healthy",
    metrics: [
      { label: "Pending Review", value: 12 },
      { label: "Processed Today", value: 48 },
      { label: "Compliance Rate", value: "99.2%" },
    ],
    alerts: 0,
    lastUpdated: "5 min ago",
  },
  {
    id: "invoices",
    name: "Invoices",
    path: "/invoices",
    icon: DollarSign,
    status: "warning",
    metrics: [
      { label: "Pending Approval", value: 34, subLabel: "$245K value" },
      { label: "Disputed", value: 5 },
      { label: "Paid (MTD)", value: "$1.8M" },
    ],
    alerts: 5,
    lastUpdated: "3 min ago",
  },
  {
    id: "risk",
    name: "Risk Monitor",
    path: "/risk",
    icon: AlertTriangle,
    status: "critical",
    metrics: [
      { label: "Active Incidents", value: 4, subLabel: "2 critical" },
      { label: "Affected Routes", value: 12 },
      { label: "Risk Score", value: "High" },
    ],
    alerts: 4,
    lastUpdated: "Just now",
  },
];

const statusConfig = {
  healthy: {
    color: "text-success",
    bgColor: "bg-success/10",
    icon: CheckCircle2,
    label: "Healthy",
  },
  warning: {
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: Clock,
    label: "Attention",
  },
  critical: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: XCircle,
    label: "Critical",
  },
};

export function ModuleOverview() {
  const navigate = useNavigate();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Module Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Consolidated view across all system modules
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = moduleStatuses.filter(m => m.status === key).length;
              if (count === 0) return null;
              return (
                <Badge key={key} variant="outline" className={cn("gap-1", config.color)}>
                  <config.icon className="h-3 w-3" />
                  {count} {config.label}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleStatuses.map((module) => {
            const status = statusConfig[module.status];
            return (
              <div
                key={module.id}
                className={cn(
                  "rounded-lg border bg-background p-4 transition-all cursor-pointer hover:shadow-md",
                  module.status === "critical" && "border-destructive/50",
                  module.status === "warning" && "border-warning/50",
                  module.status === "healthy" && "border-border"
                )}
                onClick={() => navigate(module.path)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", status.bgColor)}>
                      <module.icon className={cn("h-5 w-5", status.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{module.name}</h3>
                      <p className="text-xs text-muted-foreground">{module.lastUpdated}</p>
                    </div>
                  </div>
                  {module.alerts > 0 && (
                    <Badge 
                      variant={module.status === "critical" ? "destructive" : "secondary"}
                      className="h-6"
                    >
                      {module.alerts} {module.alerts === 1 ? "alert" : "alerts"}
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="space-y-2 mb-3">
                  {module.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                        {metric.subLabel && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({metric.subLabel})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className={cn("flex items-center gap-1 text-xs font-medium", status.color)}>
                    <status.icon className="h-3 w-3" />
                    {status.label}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
