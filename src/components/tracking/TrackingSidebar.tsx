import { 
  Upload, 
  AlertTriangle, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Archive, 
  AlertCircle,
  Bell,
  List,
  LayoutGrid,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  variant?: "default" | "warning" | "destructive";
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: AlertTriangle, label: "New Delays", count: 7, variant: "destructive" },
];

const shipmentFilters: SidebarItem[] = [
  { icon: Package, label: "All Shipments", count: 109, active: true },
  { icon: Clock, label: "Yet to start", count: 3 },
  { icon: Truck, label: "In Transit", count: 77 },
  { icon: CheckCircle2, label: "Completed", count: 13 },
  { icon: Archive, label: "Auto-Archived", count: 5 },
  { icon: AlertCircle, label: "Invalid Data", count: 7, variant: "warning" },
  { icon: Bell, label: "Action Required", count: 1, variant: "destructive" },
];

export function TrackingSidebar() {
  return (
    <div className="w-64 flex-shrink-0 bg-card border-r border-border">
      {/* Bulk Upload */}
      <div className="p-4 border-b border-border">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </div>

      {/* Alerts Section */}
      <div className="p-4 border-b border-border">
        {sidebarItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer"
          >
            <item.icon className={cn(
              "h-4 w-4",
              item.variant === "destructive" && "text-destructive",
              item.variant === "warning" && "text-warning"
            )} />
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            {item.count !== undefined && (
              <Badge 
                variant={item.variant === "destructive" ? "destructive" : "secondary"}
                className="ml-auto"
              >
                {item.count}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Shipment Filters */}
      <div className="p-4">
        {shipmentFilters.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
              item.active ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
            )}
          >
            <item.icon className={cn(
              "h-4 w-4",
              item.active && "text-primary",
              item.variant === "destructive" && "text-destructive",
              item.variant === "warning" && "text-warning"
            )} />
            <span className="text-sm font-medium">{item.label}</span>
            {item.count !== undefined && (
              <span className={cn(
                "ml-auto text-sm",
                item.active ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                ({item.count})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-muted rounded-lg p-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Calendar className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
