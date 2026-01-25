import { useMemo } from "react";
import { Ship, MapPin, Navigation } from "lucide-react";
import type { Shipment } from "@/hooks/useTracking";

interface ShipmentMapViewProps {
  shipment: Shipment;
  currentPosition: { lat: number; lng: number };
  vesselHeading: number;
}

export function ShipmentMapView({ shipment, currentPosition, vesselHeading }: ShipmentMapViewProps) {
  // Calculate progress percentage for visual representation
  const progressPercent = useMemo(() => {
    let progress = 0;
    if (shipment.progress.emptyPickup) progress += 10;
    if (shipment.progress.gateIn) progress += 15;
    if (shipment.progress.origin) progress += 20;
    if (shipment.progress.transhipment.total > 0) {
      progress += (shipment.progress.transhipment.current / shipment.progress.transhipment.total) * 30;
    } else if (shipment.progress.origin) {
      progress += 30;
    }
    if (shipment.progress.destination) progress += 20;
    if (shipment.progress.gateOut) progress += 5;
    return Math.min(progress, 100);
  }, [shipment.progress]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-300 dark:text-slate-600" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route visualization */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-3xl">
          {/* Route line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
            {/* Background line */}
            <div className="absolute inset-0 bg-slate-300 dark:bg-slate-600 rounded-full" />
            {/* Progress line */}
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Dashed remaining */}
            <div 
              className="absolute right-0 top-0 h-full border-t-2 border-dashed border-slate-400 dark:border-slate-500"
              style={{ width: `${100 - progressPercent}%` }}
            />
          </div>

          {/* Origin marker */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-foreground">{shipment.origin.port.split(",")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{shipment.origin.country}</p>
              </div>
            </div>
          </div>

          {/* Vessel marker */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="flex flex-col items-center">
              <div 
                className="w-12 h-12 rounded-full bg-primary border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center animate-pulse"
                style={{ transform: `rotate(${vesselHeading}deg)` }}
              >
                <Ship className="h-6 w-6 text-white" />
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-primary">{shipment.carrier.name}</p>
                <p className="text-[10px] text-muted-foreground">{shipment.containerId}</p>
              </div>
            </div>
          </div>

          {/* Destination marker */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-red-500 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-foreground">{shipment.destination.port.split(",")[0]}</p>
                <p className="text-muted-foreground text-[10px]">{shipment.destination.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vessel Info Card Overlay */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border max-w-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground">{shipment.carrier.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Container: {shipment.containerId}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div>
                <span className="text-muted-foreground">Progress:</span>
                <span className="ml-1 font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Heading:</span>
                <span className="ml-1 font-medium">{vesselHeading}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-foreground">Tracking Active</span>
        <span className="text-xs text-muted-foreground">• Updated 2 min ago</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-primary rounded" />
            <span className="text-muted-foreground">Completed Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 border-t-2 border-dashed border-slate-400" />
            <span className="text-muted-foreground">Remaining Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Origin Port</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Destination Port</span>
          </div>
        </div>
      </div>

      {/* Journey Stats */}
      <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground">ETA</p>
            <p className="font-semibold text-foreground">{shipment.carrierEta || "TBD"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className={`font-semibold ${shipment.status === 'delayed' ? 'text-destructive' : 'text-green-600'}`}>
              {shipment.status === 'delayed' ? 'Delayed' : 'On Time'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
