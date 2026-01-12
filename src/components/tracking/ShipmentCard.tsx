import { 
  Star, 
  Users, 
  Ship, 
  AlertTriangle, 
  Check,
  Share2,
  MoreVertical,
  Scissors
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShipmentCardProps {
  containerId: string;
  rfNumber?: string;
  isNew?: boolean;
  carrier: {
    code: string;
    name: string;
  };
  origin: {
    port: string;
    country: string;
    countryCode: string;
  };
  destination: {
    port: string;
    country: string;
    countryCode: string;
  };
  consignee: string;
  carrierEta?: string;
  prediction?: {
    daysLate: number;
  };
  status: "delayed" | "active" | "on-time" | "completed";
  progress: {
    emptyPickup: boolean;
    gateIn: boolean;
    origin: boolean;
    transhipment: { current: number; total: number };
    destination: boolean;
    gateOut: boolean;
    emptyReturn: boolean;
  };
  alert?: string;
}

const getFlagEmoji = (countryCode: string) => {
  const flags: Record<string, string> = {
    IN: "🇮🇳",
    US: "🇺🇸",
    NL: "🇳🇱",
    UG: "🇺🇬",
    CN: "🇨🇳",
    DE: "🇩🇪",
    UK: "🇬🇧",
    SG: "🇸🇬",
    AE: "🇦🇪",
    JP: "🇯🇵",
  };
  return flags[countryCode] || "🏳️";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "delayed":
      return { label: "DELAYED", className: "bg-destructive text-destructive-foreground" };
    case "active":
      return { label: "ACTIVE", className: "bg-primary text-primary-foreground" };
    case "on-time":
      return { label: "ON TIME", className: "bg-success text-white" };
    case "completed":
      return { label: "COMPLETED", className: "bg-muted text-muted-foreground" };
    default:
      return { label: status.toUpperCase(), className: "bg-muted text-muted-foreground" };
  }
};

export function ShipmentCard({
  containerId,
  rfNumber,
  isNew = false,
  carrier,
  origin,
  destination,
  consignee,
  carrierEta,
  prediction,
  status,
  progress,
  alert,
}: ShipmentCardProps) {
  const statusBadge = getStatusBadge(status);

  const progressSteps = [
    { label: "Empty Pickup", completed: progress.emptyPickup },
    { label: "Gate In", completed: progress.gateIn },
    { label: "Origin", completed: progress.origin },
    { label: `Transhipment (${progress.transhipment.current}/${progress.transhipment.total})`, completed: progress.transhipment.current > 0 },
    { label: "Destination", completed: progress.destination },
    { label: "Gate out", completed: progress.gateOut },
    { label: "Empty Return", completed: progress.emptyReturn },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Main Content Row */}
      <div className="flex items-center gap-6 px-4 py-4">
        {/* Favorite */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-warning">
          <Star className="h-4 w-4" />
        </Button>

        {/* Container ID */}
        <div className="min-w-[140px]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            RF: {rfNumber || "—"}
            <Users className="h-3 w-3" />
            {isNew && (
              <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                NEW
              </Badge>
            )}
          </div>
          <div className="font-mono font-semibold text-foreground">{containerId}</div>
        </div>

        {/* Carrier */}
        <div className="min-w-[100px]">
          <div className="text-xs text-muted-foreground">Carrier</div>
          <div className="flex items-center gap-1 font-medium text-foreground">
            {carrier.code}
            <Ship className="h-3 w-3" />
          </div>
        </div>

        {/* Route */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-sm">
            <span>{getFlagEmoji(origin.countryCode)}</span>
            <span className="text-foreground">{origin.port}, {origin.country}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{getFlagEmoji(destination.countryCode)}</span>
            <span className="text-foreground">{destination.port}, {destination.country}</span>
          </div>
        </div>

        {/* Consignee */}
        <div className="min-w-[100px]">
          <div className="text-xs text-muted-foreground">Consignee</div>
          <div className="text-sm text-foreground truncate max-w-[100px]">{consignee}</div>
        </div>

        {/* Carrier ETA */}
        <div className="min-w-[100px]">
          <div className="text-xs text-muted-foreground">Carrier ETA</div>
          <div className="text-sm text-primary underline cursor-pointer">
            {carrierEta || "No Carrier ETA"}
          </div>
        </div>

        {/* Prediction */}
        <div className="min-w-[100px]">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Ship className="h-3 w-3" />
            Prediction
          </div>
          {prediction && (
            <div className={cn(
              "text-sm font-medium",
              prediction.daysLate > 0 ? "text-destructive" : "text-success"
            )}>
              {prediction.daysLate > 0 ? `${prediction.daysLate} Days Late` : "On Time"}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <Badge className={cn("min-w-[80px] justify-center", statusBadge.className)}>
          {statusBadge.label}
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Scissors className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Shipment</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between">
          {progressSteps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div className={cn(
                    "flex-1 h-0.5",
                    step.completed ? "bg-primary" : "bg-border"
                  )} />
                )}
                <div className={cn(
                  "h-3 w-3 rounded-full border-2 flex items-center justify-center",
                  step.completed 
                    ? "bg-primary border-primary" 
                    : "bg-background border-border"
                )}>
                  {step.completed && <Ship className="h-2 w-2 text-primary-foreground" />}
                </div>
                {index < progressSteps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5",
                    progressSteps[index + 1]?.completed ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 text-center">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Message */}
      {alert && (
        <div className="flex items-center justify-between px-4 py-2 bg-warning/10 border-t border-warning/20">
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertTriangle className="h-4 w-4" />
            {alert}
          </div>
          <Button size="sm" className="gap-2">
            <Check className="h-3 w-3" />
            Mark as Read
          </Button>
        </div>
      )}
    </div>
  );
}
