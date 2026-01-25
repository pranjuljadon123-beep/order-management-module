import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ship } from "lucide-react";
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

// Custom icon for origin
const originIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background-color: hsl(142, 76%, 36%); width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom icon for destination
const destIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background-color: hsl(0, 72%, 51%); width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom icon for vessel
const createVesselIcon = (heading: number) => new L.DivIcon({
  className: "vessel-marker",
  html: `
    <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="background-color: hsl(210, 79%, 46%); padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 12px rgba(0,0,0,0.4);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
          <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
          <path d="M12 10v4"/>
          <path d="M12 2v3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to fit bounds
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

export function ShipmentMapView({ shipment, currentPosition, vesselHeading }: ShipmentMapViewProps) {
  const originCoords = useMemo(() => getPortCoordinates(shipment.origin.port), [shipment.origin.port]);
  const destCoords = useMemo(() => getPortCoordinates(shipment.destination.port), [shipment.destination.port]);

  // Create route polyline points
  const routePoints: [number, number][] = useMemo(() => {
    return [
      [originCoords.lat, originCoords.lng],
      [currentPosition.lat, currentPosition.lng],
      [destCoords.lat, destCoords.lng],
    ];
  }, [originCoords, currentPosition, destCoords]);

  const traveledRoute: [number, number][] = useMemo(() => {
    return [
      [originCoords.lat, originCoords.lng],
      [currentPosition.lat, currentPosition.lng],
    ];
  }, [originCoords, currentPosition]);

  const remainingRoute: [number, number][] = useMemo(() => {
    return [
      [currentPosition.lat, currentPosition.lng],
      [destCoords.lat, destCoords.lng],
    ];
  }, [currentPosition, destCoords]);

  // Calculate bounds
  const bounds = useMemo(() => {
    return L.latLngBounds([
      [originCoords.lat, originCoords.lng],
      [currentPosition.lat, currentPosition.lng],
      [destCoords.lat, destCoords.lng],
    ]);
  }, [originCoords, currentPosition, destCoords]);

  const vesselIcon = useMemo(() => createVesselIcon(vesselHeading), [vesselHeading]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        center={[currentPosition.lat, currentPosition.lng]}
        zoom={4}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds bounds={bounds} />

        {/* Remaining route (dashed) */}
        <Polyline
          positions={remainingRoute}
          pathOptions={{
            color: "#94a3b8",
            weight: 3,
            dashArray: "10, 10",
            opacity: 0.7,
          }}
        />

        {/* Traveled route (solid) */}
        <Polyline
          positions={traveledRoute}
          pathOptions={{
            color: "#2563eb",
            weight: 4,
            opacity: 0.9,
          }}
        />

        {/* Origin marker */}
        <Marker position={[originCoords.lat, originCoords.lng]} icon={originIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-green-700">Origin</div>
              <div>{shipment.origin.port}</div>
              <div className="text-muted-foreground">{shipment.origin.country}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-red-700">Destination</div>
              <div>{shipment.destination.port}</div>
              <div className="text-muted-foreground">{shipment.destination.country}</div>
            </div>
          </Popup>
        </Marker>

        {/* Vessel marker */}
        <Marker position={[currentPosition.lat, currentPosition.lng]} icon={vesselIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-blue-700">{shipment.carrier.name}</div>
              <div>Container: {shipment.containerId}</div>
              <div className="text-muted-foreground">Heading: {vesselHeading}°</div>
              <div className="text-muted-foreground">Speed: 14.2 kn</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Vessel Info Card Overlay */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border max-w-xs z-[1000]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground">{shipment.carrier.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Container: {shipment.containerId}</p>
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2 z-[1000]">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-foreground">Live AIS Data</span>
        <span className="text-xs text-muted-foreground">• Updated 2 min ago</span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-blue-600 rounded" />
            <span className="text-muted-foreground">Traveled Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 border-t-2 border-dashed border-slate-400" />
            <span className="text-muted-foreground">Remaining Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-muted-foreground">Origin Port</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-muted-foreground">Destination Port</span>
          </div>
        </div>
      </div>
    </div>
  );
}
