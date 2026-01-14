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
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid" | "calendar";
export type ShipmentFilter = "all" | "yet-to-start" | "in-transit" | "completed" | "archived" | "invalid" | "action-required" | "delayed";

interface TrackingSidebarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  shipmentFilter: ShipmentFilter;
  setShipmentFilter: (filter: ShipmentFilter) => void;
  stats: {
    all: number;
    yetToStart: number;
    inTransit: number;
    completed: number;
    archived: number;
    invalid: number;
    actionRequired: number;
    delayed: number;
  };
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onBulkUpload: () => void;
}

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  filter: ShipmentFilter;
  variant?: "default" | "warning" | "destructive";
}

export function TrackingSidebar({
  viewMode,
  setViewMode,
  shipmentFilter,
  setShipmentFilter,
  stats,
  collapsed,
  setCollapsed,
  onBulkUpload,
}: TrackingSidebarProps) {
  const alertItems: SidebarItem[] = [
    { icon: AlertTriangle, label: "New Delays", count: stats.delayed, filter: "delayed", variant: "destructive" },
  ];

  const shipmentFilters: SidebarItem[] = [
    { icon: Package, label: "All Shipments", count: stats.all, filter: "all" },
    { icon: Clock, label: "Yet to start", count: stats.yetToStart, filter: "yet-to-start" },
    { icon: Truck, label: "In Transit", count: stats.inTransit, filter: "in-transit" },
    { icon: CheckCircle2, label: "Completed", count: stats.completed, filter: "completed" },
    { icon: Archive, label: "Auto-Archived", count: stats.archived, filter: "archived" },
    { icon: AlertCircle, label: "Invalid Data", count: stats.invalid, filter: "invalid", variant: "warning" },
    { icon: Bell, label: "Action Required", count: stats.actionRequired, filter: "action-required", variant: "destructive" },
  ];

  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 bg-card border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mb-4"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 mb-2" onClick={onBulkUpload}>
          <Upload className="h-4 w-4" />
        </Button>
        {shipmentFilters.slice(0, 4).map((item) => (
          <Button
            key={item.filter}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 mb-1",
              shipmentFilter === item.filter && "bg-primary/10 text-primary"
            )}
            onClick={() => setShipmentFilter(item.filter)}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      {/* Collapse Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk Upload */}
      <div className="px-4 pb-4 border-b border-border">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={onBulkUpload}>
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </div>

      {/* Alerts Section */}
      <div className="p-4 border-b border-border">
        {alertItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
              shipmentFilter === item.filter ? "bg-destructive/10" : "hover:bg-muted"
            )}
            onClick={() => setShipmentFilter(item.filter)}
          >
            <item.icon className={cn(
              "h-4 w-4",
              item.variant === "destructive" && "text-destructive",
              item.variant === "warning" && "text-warning"
            )} />
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            {item.count > 0 && (
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
      <div className="flex-1 p-4 overflow-auto">
        {shipmentFilters.map((item) => (
          <div
            key={item.filter}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
              shipmentFilter === item.filter ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
            )}
            onClick={() => setShipmentFilter(item.filter)}
          >
            <item.icon className={cn(
              "h-4 w-4",
              shipmentFilter === item.filter && "text-primary",
              item.variant === "destructive" && shipmentFilter !== item.filter && "text-destructive",
              item.variant === "warning" && shipmentFilter !== item.filter && "text-warning"
            )} />
            <span className="text-sm font-medium">{item.label}</span>
            <span className={cn(
              "ml-auto text-sm",
              shipmentFilter === item.filter ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              ({item.count})
            </span>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", viewMode === "list" && "bg-background")}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", viewMode === "grid" && "bg-background")}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", viewMode === "calendar" && "bg-background")}
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
