import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Locate, 
  Maximize2,
  Ship,
  Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/hooks/useTracking";

interface ShipmentMapViewProps {
  shipment: Shipment;
  currentPosition: { lat: number; lng: number };
  vesselHeading: number;
}

// Simple function to get approximate coordinates for major ports
function getPortCoordinates(portName: string): { lat: number; lng: number } {
  const portCoords: Record<string, { lat: number; lng: number }> = {
    "jakarta": { lat: -6.1, lng: 106.8 },
    "surabaya": { lat: -7.25, lng: 112.75 },
    "singapore": { lat: 1.29, lng: 103.85 },
    "rotterdam": { lat: 51.9, lng: 4.5 },
    "shanghai": { lat: 31.2, lng: 121.5 },
    "hamburg": { lat: 53.55, lng: 9.99 },
    "antwerp": { lat: 51.26, lng: 4.4 },
    "dubai": { lat: 25.27, lng: 55.29 },
    "mumbai": { lat: 19.08, lng: 72.88 },
    "nhava sheva": { lat: 18.95, lng: 72.95 },
    "new york": { lat: 40.68, lng: -74.04 },
    "los angeles": { lat: 33.74, lng: -118.27 },
    "chicago": { lat: 41.88, lng: -87.63 },
    "ennore": { lat: 13.22, lng: 80.32 },
    "busan": { lat: 35.1, lng: 129.03 },
    "mombasa": { lat: -4.04, lng: 39.67 },
    "kampala": { lat: 0.35, lng: 32.58 },
  };

  const lowerPortName = portName.toLowerCase();
  for (const [key, coords] of Object.entries(portCoords)) {
    if (lowerPortName.includes(key)) {
      return coords;
    }
  }
  return { lat: 0, lng: 0 };
}

export function ShipmentMapView({ shipment, currentPosition, vesselHeading }: ShipmentMapViewProps) {
  const originCoords = useMemo(() => getPortCoordinates(shipment.origin.port), [shipment.origin.port]);
  const destCoords = useMemo(() => getPortCoordinates(shipment.destination.port), [shipment.destination.port]);

  // Calculate SVG viewBox to fit the route
  const viewBox = useMemo(() => {
    const minLat = Math.min(originCoords.lat, destCoords.lat, currentPosition.lat) - 10;
    const maxLat = Math.max(originCoords.lat, destCoords.lat, currentPosition.lat) + 10;
    const minLng = Math.min(originCoords.lng, destCoords.lng, currentPosition.lng) - 15;
    const maxLng = Math.max(originCoords.lng, destCoords.lng, currentPosition.lng) + 15;
    
    return {
      x: minLng,
      y: -maxLat,
      width: maxLng - minLng,
      height: maxLat - minLat
    };
  }, [originCoords, destCoords, currentPosition]);

  // Convert lat/lng to SVG coordinates
  const toSvg = (lat: number, lng: number) => ({ x: lng, y: -lat });

  const origin = toSvg(originCoords.lat, originCoords.lng);
  const dest = toSvg(destCoords.lat, destCoords.lng);
  const current = toSvg(currentPosition.lat, currentPosition.lng);

  // Create curved path through current position
  const midX = (origin.x + dest.x) / 2;
  const midY = (origin.y + dest.y) / 2;
  const curveOffset = Math.abs(origin.x - dest.x) * 0.15;

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 overflow-hidden">
      {/* Map SVG */}
      <svg 
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid pattern for ocean */}
        <defs>
          <pattern id="oceanGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(210, 40%, 80%)" strokeWidth="0.1" className="dark:stroke-blue-900/50" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(142, 76%, 36%)" />
            <stop offset="100%" stopColor="hsl(210, 79%, 46%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ocean background */}
        <rect 
          x={viewBox.x - 50} 
          y={viewBox.y - 50} 
          width={viewBox.width + 100} 
          height={viewBox.height + 100} 
          fill="url(#oceanGrid)" 
        />

        {/* Expected route (dashed) */}
        <path
          d={`M ${origin.x} ${origin.y} Q ${midX} ${midY - curveOffset} ${dest.x} ${dest.y}`}
          stroke="hsl(210, 30%, 60%)"
          strokeWidth="0.8"
          strokeDasharray="3,2"
          fill="none"
          className="dark:stroke-blue-400/40"
        />

        {/* Actual route traveled (solid gradient) */}
        <path
          d={`M ${origin.x} ${origin.y} Q ${(origin.x + current.x) / 2} ${(origin.y + current.y) / 2 - curveOffset * 0.5} ${current.x} ${current.y}`}
          stroke="url(#routeGradient)"
          strokeWidth="1.2"
          fill="none"
          filter="url(#glow)"
        />

        {/* Origin port marker */}
        <g transform={`translate(${origin.x}, ${origin.y})`}>
          <circle r="3" fill="hsl(142, 76%, 36%)" />
          <circle r="5" fill="none" stroke="hsl(142, 76%, 36%)" strokeWidth="0.5" opacity="0.5" />
          <text x="7" y="1" fontSize="4" fill="hsl(142, 76%, 26%)" fontWeight="600" className="dark:fill-green-400">
            Origin
          </text>
          <text x="7" y="5" fontSize="2.5" fill="hsl(210, 20%, 50%)" className="dark:fill-slate-400">
            {shipment.origin.port.split(",")[0]}
          </text>
        </g>

        {/* Destination port marker */}
        <g transform={`translate(${dest.x}, ${dest.y})`}>
          <circle r="3" fill="hsl(0, 72%, 51%)" />
          <circle r="5" fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="0.5" opacity="0.5" />
          <text x="7" y="1" fontSize="4" fill="hsl(0, 72%, 41%)" fontWeight="600" className="dark:fill-red-400">
            Dest.
          </text>
          <text x="7" y="5" fontSize="2.5" fill="hsl(210, 20%, 50%)" className="dark:fill-slate-400">
            {shipment.destination.port.split(",")[0]}
          </text>
        </g>

        {/* Current vessel position */}
        <g transform={`translate(${current.x}, ${current.y}) rotate(${vesselHeading})`}>
          {/* Vessel glow */}
          <circle r="4" fill="hsl(210, 79%, 46%)" opacity="0.3" className="animate-ping" />
          {/* Vessel icon */}
          <polygon 
            points="0,-3 2,3 -2,3" 
            fill="hsl(210, 79%, 46%)"
            className="dark:fill-blue-400"
          />
          <circle r="1.5" fill="white" />
        </g>

        {/* Vessel label */}
        <g transform={`translate(${current.x + 5}, ${current.y})`}>
          <rect x="-1" y="-4" width="25" height="8" rx="1" fill="hsl(210, 79%, 46%)" opacity="0.9" />
          <text x="0" y="0" fontSize="3" fill="white" fontWeight="600">
            {shipment.carrier.code}
          </text>
          <text x="0" y="3" fontSize="2" fill="white" opacity="0.8">
            In Transit
          </text>
        </g>
      </svg>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/95 backdrop-blur-sm shadow-lg">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-20 right-4 flex flex-col gap-1">
        <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/95 backdrop-blur-sm shadow-lg rounded-b-none">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/95 backdrop-blur-sm shadow-lg rounded-t-none border-t-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 right-4">
        <Button variant="secondary" size="icon" className="h-9 w-9 bg-background/95 backdrop-blur-sm shadow-lg">
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-gradient-to-r from-green-600 to-primary" />
            <span className="text-muted-foreground">Actual Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 border-t-2 border-dashed border-muted-foreground/50" />
            <span className="text-muted-foreground">Expected Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-muted-foreground">Origin Port</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Destination Port</span>
          </div>
        </div>
      </div>

      {/* Vessel Info Card */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border max-w-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground">{shipment.carrier.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Vessel ID: {shipment.containerId}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div>
                <span className="text-muted-foreground">Speed:</span>
                <span className="ml-1 font-medium">14.2 kn</span>
              </div>
              <div>
                <span className="text-muted-foreground">Heading:</span>
                <span className="ml-1 font-medium">{vesselHeading}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AIS Data Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-foreground">Live AIS Data</span>
        <span className="text-xs text-muted-foreground">• Updated 2 min ago</span>
      </div>
    </div>
  );
}
