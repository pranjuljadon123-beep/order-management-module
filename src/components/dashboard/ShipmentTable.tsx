import { Ship, Plane, Truck, MoreHorizontal, Eye, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const shipments = [
  {
    id: "SHP-2024-001",
    origin: "Shanghai, CN",
    destination: "Los Angeles, US",
    mode: "ocean",
    carrier: "Maersk Line",
    status: "in-transit",
    eta: "Dec 18, 2024",
    progress: 65,
  },
  {
    id: "SHP-2024-002",
    origin: "Frankfurt, DE",
    destination: "Singapore, SG",
    mode: "air",
    carrier: "Lufthansa Cargo",
    status: "arrived",
    eta: "Dec 11, 2024",
    progress: 100,
  },
  {
    id: "SHP-2024-003",
    origin: "Mumbai, IN",
    destination: "Dubai, UAE",
    mode: "ocean",
    carrier: "MSC",
    status: "delayed",
    eta: "Dec 20, 2024",
    progress: 40,
  },
  {
    id: "SHP-2024-004",
    origin: "Chicago, US",
    destination: "Toronto, CA",
    mode: "road",
    carrier: "XPO Logistics",
    status: "in-transit",
    eta: "Dec 12, 2024",
    progress: 80,
  },
  {
    id: "SHP-2024-005",
    origin: "Rotterdam, NL",
    destination: "New York, US",
    mode: "ocean",
    carrier: "Hapag-Lloyd",
    status: "in-transit",
    eta: "Dec 22, 2024",
    progress: 30,
  },
];

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "ocean":
      return Ship;
    case "air":
      return Plane;
    default:
      return Truck;
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    "in-transit": "bg-cyan-light text-accent",
    arrived: "bg-success-light text-success",
    delayed: "bg-warning-light text-warning",
    pending: "bg-secondary text-muted-foreground",
  };
  return styles[status as keyof typeof styles] || styles.pending;
};

export function ShipmentTable() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div>
          <h3 className="font-semibold text-foreground">Recent Shipments</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage your active shipments
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="bg-muted/30">
              <th>Shipment ID</th>
              <th>Route</th>
              <th>Mode</th>
              <th>Carrier</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Progress</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment, index) => {
              const ModeIcon = getModeIcon(shipment.mode);
              return (
                <tr
                  key={shipment.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td>
                    <span className="font-medium text-foreground">
                      {shipment.id}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-foreground">{shipment.origin}</span>
                      <span className="text-xs text-muted-foreground">
                        → {shipment.destination}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                        <ModeIcon className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="capitalize text-foreground">
                        {shipment.mode}
                      </span>
                    </div>
                  </td>
                  <td className="text-foreground">{shipment.carrier}</td>
                  <td>
                    <span
                      className={cn(
                        "status-badge capitalize",
                        getStatusBadge(shipment.status)
                      )}
                    >
                      {shipment.status === "delayed" && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {shipment.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="text-foreground">{shipment.eta}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            shipment.status === "delayed"
                              ? "bg-warning"
                              : shipment.status === "arrived"
                              ? "bg-success"
                              : "bg-accent"
                          )}
                          style={{ width: `${shipment.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {shipment.progress}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
