import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ship, MapPin } from "lucide-react";
import type { Shipment } from "@/hooks/useTracking";

interface ShipmentMapViewProps {
  shipment: Shipment;
  currentPosition: { lat: number; lng: number };
  vesselHeading: number;
}

// Custom icon creator using SVG
function createSvgIcon(color: string, type: "origin" | "destination" | "vessel") {
  const size = type === "vessel" ? 40 : 32;
  const svgMap: Record<string, string> = {
    origin: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    destination: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    vessel: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>`,
  };

  const bgColor = type === "origin" ? "#22c55e" : type === "destination" ? "#ef4444" : color;
  
  return L.divIcon({
    className: "custom-map-marker",
    html: `<div style="
      background: ${bgColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      ${type === 'vessel' ? 'animation: pulse-ring 2s ease-out infinite;' : ''}
    ">${svgMap[type]}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Component to fit map bounds
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 6 });
    }
  }, [map, positions]);
  return null;
}

export function ShipmentMapView({ shipment, currentPosition, vesselHeading }: ShipmentMapViewProps) {
  const originCoords = useMemo(() => getPortCoords(shipment.origin.port), [shipment.origin.port]);
  const destCoords = useMemo(() => getPortCoords(shipment.destination.port), [shipment.destination.port]);

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

  const originIcon = useMemo(() => createSvgIcon("#22c55e", "origin"), []);
  const destIcon = useMemo(() => createSvgIcon("#ef4444", "destination"), []);
  const vesselIcon = useMemo(() => createSvgIcon(shipment.status === "delayed" ? "#ef4444" : "#3b82f6", "vessel"), [shipment.status]);

  // Route line: origin → current → destination
  const completedRoute: [number, number][] = [
    [originCoords.lat, originCoords.lng],
    [currentPosition.lat, currentPosition.lng],
  ];
  const remainingRoute: [number, number][] = [
    [currentPosition.lat, currentPosition.lng],
    [destCoords.lat, destCoords.lng],
  ];

  const allPositions: [number, number][] = [
    [originCoords.lat, originCoords.lng],
    [currentPosition.lat, currentPosition.lng],
    [destCoords.lat, destCoords.lng],
  ];

  const center: [number, number] = [currentPosition.lat, currentPosition.lng];

  return (
    <div className="relative h-full w-full">
      <style>{`
        .custom-map-marker { background: transparent !important; border: none !important; }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
          70% { box-shadow: 0 0 0 15px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={4}
        className="h-full w-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Satellite-style dark tile layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
        {/* Labels overlay */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=""
        />

        <FitBounds positions={allPositions} />

        {/* Completed route */}
        <Polyline
          positions={completedRoute}
          pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.9 }}
        />
        {/* Remaining route (dashed) */}
        <Polyline
          positions={remainingRoute}
          pathOptions={{ color: "#94a3b8", weight: 2, opacity: 0.7, dashArray: "10, 8" }}
        />

        {/* Origin */}
        <Marker position={[originCoords.lat, originCoords.lng]} icon={originIcon}>
          <Popup>
            <div className="text-sm font-medium">{shipment.origin.port.split(",")[0]}</div>
            <div className="text-xs text-gray-500">{shipment.origin.country} — Origin</div>
          </Popup>
        </Marker>

        {/* Destination */}
        <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon}>
          <Popup>
            <div className="text-sm font-medium">{shipment.destination.port.split(",")[0]}</div>
            <div className="text-xs text-gray-500">{shipment.destination.country} — Destination</div>
          </Popup>
        </Marker>

        {/* Vessel */}
        <Marker position={[currentPosition.lat, currentPosition.lng]} icon={vesselIcon}>
          <Popup>
            <div className="text-sm font-semibold">{shipment.carrier.name}</div>
            <div className="text-xs text-gray-500">Container: {shipment.containerId}</div>
            <div className="text-xs text-gray-500">Heading: {vesselHeading}°</div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Vessel Info Overlay */}
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2 z-[1000]">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-foreground">Live Tracking</span>
        <span className="text-xs text-muted-foreground">• Satellite View</span>
      </div>

      {/* Journey Stats */}
      <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
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

function getPortCoords(portName: string): { lat: number; lng: number } {
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
    "jnpt": { lat: 18.95, lng: 72.95 },
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
    if (lowerPortName.includes(key)) return coords;
  }
  return { lat: 0, lng: 0 };
}
