import { useMemo, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ship } from "lucide-react";
import type { Shipment } from "@/hooks/useTracking";

interface ShipmentMapViewProps {
  shipment: Shipment;
  currentPosition: { lat: number; lng: number };
  vesselHeading: number;
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

// Major shipping waypoints
const WAYPOINTS = {
  malaccaStrait: { lat: 1.8, lng: 102.5 },
  singaporeStrait: { lat: 1.2, lng: 104.0 },
  sriLankaSouth: { lat: 5.9, lng: 80.2 },
  adenGulf: { lat: 12.5, lng: 45.0 },
  babElMandeb: { lat: 12.6, lng: 43.3 },
  redSeaSouth: { lat: 13.5, lng: 42.5 },
  redSeaNorth: { lat: 27.8, lng: 34.2 },
  suezSouth: { lat: 29.95, lng: 32.56 },
  suezNorth: { lat: 31.26, lng: 32.32 },
  mediterranean: { lat: 35.0, lng: 24.0 },
  gibraltarStrait: { lat: 35.96, lng: -5.5 },
  bayOfBiscay: { lat: 45.0, lng: -5.0 },
  englishChannel: { lat: 50.5, lng: 0.5 },
  capeOfGoodHope: { lat: -34.35, lng: 18.5 },
  westAfricaCoast: { lat: 5.0, lng: -2.0 },
  midAtlantic: { lat: 30.0, lng: -40.0 },
  northAtlantic: { lat: 40.0, lng: -50.0 },
  usEastApproach: { lat: 38.0, lng: -70.0 },
  arabianSea: { lat: 18.0, lng: 62.0 },
  hormuzStrait: { lat: 26.5, lng: 56.2 },
  indianOceanCentral: { lat: -5.0, lng: 65.0 },
  southChinaSea: { lat: 12.0, lng: 114.0 },
  taiwanStrait: { lat: 24.0, lng: 119.5 },
  eastChinaSea: { lat: 30.0, lng: 125.0 },
  pacificNorthWest: { lat: 35.0, lng: -160.0 },
  pacificMid: { lat: 30.0, lng: 170.0 },
  hawaiiApproach: { lat: 22.0, lng: -155.0 },
  usWestApproach: { lat: 33.0, lng: -120.0 },
  koreaStrait: { lat: 34.0, lng: 129.0 },
  mozambiqueChannel: { lat: -15.0, lng: 42.0 },
  eastAfricaCoast: { lat: -8.0, lng: 42.0 },
  panamaCaribbean: { lat: 9.4, lng: -79.9 },
  panamaPacific: { lat: 8.95, lng: -79.55 },
  caribbeanSea: { lat: 18.0, lng: -75.0 },
  greatLakesEntry: { lat: 43.5, lng: -79.5 },
};

type WP = { lat: number; lng: number };

/**
 * Build a realistic shipping route between origin and destination
 * using known waypoints based on region matching.
 */
function buildShippingRoute(origin: WP, destination: WP, originPort: string, destPort: string): WP[] {
  const oPort = originPort.toLowerCase();
  const dPort = destPort.toLowerCase();

  // India (Ennore/JNPT/Mumbai) → US East Coast (New York/Chicago)
  if ((oPort.includes("ennore") || oPort.includes("jnpt") || oPort.includes("mumbai") || oPort.includes("nhava")) &&
      (dPort.includes("new york") || dPort.includes("chicago"))) {
    return [
      origin,
      WAYPOINTS.sriLankaSouth,
      WAYPOINTS.arabianSea,
      WAYPOINTS.adenGulf,
      WAYPOINTS.babElMandeb,
      WAYPOINTS.redSeaSouth,
      WAYPOINTS.redSeaNorth,
      WAYPOINTS.suezSouth,
      WAYPOINTS.suezNorth,
      WAYPOINTS.mediterranean,
      WAYPOINTS.gibraltarStrait,
      WAYPOINTS.midAtlantic,
      WAYPOINTS.northAtlantic,
      WAYPOINTS.usEastApproach,
      destination,
    ];
  }

  // Rotterdam → East Africa (Mombasa/Kampala)
  if (oPort.includes("rotterdam") && (dPort.includes("mombasa") || dPort.includes("kampala"))) {
    return [
      origin,
      WAYPOINTS.englishChannel,
      WAYPOINTS.bayOfBiscay,
      WAYPOINTS.gibraltarStrait,
      WAYPOINTS.mediterranean,
      WAYPOINTS.suezNorth,
      WAYPOINTS.suezSouth,
      WAYPOINTS.redSeaNorth,
      WAYPOINTS.redSeaSouth,
      WAYPOINTS.babElMandeb,
      WAYPOINTS.adenGulf,
      WAYPOINTS.eastAfricaCoast,
      destination,
    ];
  }

  // India → Europe (Rotterdam/Hamburg/Antwerp)
  if ((oPort.includes("ennore") || oPort.includes("jnpt") || oPort.includes("mumbai")) &&
      (dPort.includes("rotterdam") || dPort.includes("hamburg") || dPort.includes("antwerp"))) {
    return [
      origin,
      WAYPOINTS.sriLankaSouth,
      WAYPOINTS.arabianSea,
      WAYPOINTS.adenGulf,
      WAYPOINTS.babElMandeb,
      WAYPOINTS.redSeaSouth,
      WAYPOINTS.redSeaNorth,
      WAYPOINTS.suezSouth,
      WAYPOINTS.suezNorth,
      WAYPOINTS.mediterranean,
      WAYPOINTS.gibraltarStrait,
      WAYPOINTS.bayOfBiscay,
      WAYPOINTS.englishChannel,
      destination,
    ];
  }

  // Shanghai/China → Europe (Hamburg/Rotterdam)
  if ((oPort.includes("shanghai") || oPort.includes("ningbo")) &&
      (dPort.includes("hamburg") || dPort.includes("rotterdam") || dPort.includes("antwerp"))) {
    return [
      origin,
      WAYPOINTS.taiwanStrait,
      WAYPOINTS.southChinaSea,
      WAYPOINTS.malaccaStrait,
      WAYPOINTS.sriLankaSouth,
      WAYPOINTS.arabianSea,
      WAYPOINTS.adenGulf,
      WAYPOINTS.babElMandeb,
      WAYPOINTS.redSeaSouth,
      WAYPOINTS.redSeaNorth,
      WAYPOINTS.suezSouth,
      WAYPOINTS.suezNorth,
      WAYPOINTS.mediterranean,
      WAYPOINTS.gibraltarStrait,
      WAYPOINTS.bayOfBiscay,
      WAYPOINTS.englishChannel,
      destination,
    ];
  }

  // Singapore → Dubai
  if (oPort.includes("singapore") && dPort.includes("dubai")) {
    return [
      origin,
      WAYPOINTS.malaccaStrait,
      WAYPOINTS.sriLankaSouth,
      WAYPOINTS.arabianSea,
      WAYPOINTS.hormuzStrait,
      destination,
    ];
  }

  // Busan (Korea) → Los Angeles (Trans-Pacific)
  if (oPort.includes("busan") && (dPort.includes("los angeles") || dPort.includes("long beach"))) {
    return [
      origin,
      WAYPOINTS.koreaStrait,
      { lat: 35.0, lng: 140.0 }, // East of Japan
      { lat: 38.0, lng: 160.0 }, // North Pacific
      { lat: 36.0, lng: 180.0 }, // Date line
      { lat: 34.0, lng: -160.0 }, // Mid Pacific
      { lat: 33.5, lng: -140.0 },
      { lat: 33.5, lng: -125.0 },
      destination,
    ];
  }

  // Shanghai/China → US West Coast
  if ((oPort.includes("shanghai") || oPort.includes("ningbo")) &&
      (dPort.includes("los angeles") || dPort.includes("long beach"))) {
    return [
      origin,
      WAYPOINTS.eastChinaSea,
      { lat: 35.0, lng: 145.0 },
      { lat: 38.0, lng: 170.0 },
      { lat: 36.0, lng: -170.0 },
      { lat: 34.0, lng: -150.0 },
      { lat: 33.5, lng: -130.0 },
      destination,
    ];
  }

  // Fallback: generate a gentle curved route via intermediate points
  return generateCurvedFallback(origin, destination);
}

function generateCurvedFallback(origin: WP, destination: WP): WP[] {
  const points: WP[] = [origin];
  const steps = 6;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const lat = origin.lat + (destination.lat - origin.lat) * t;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    // Add curvature offset
    const offset = Math.sin(t * Math.PI) * 8 * (origin.lat > destination.lat ? -1 : 1);
    points.push({ lat: lat + offset * 0.3, lng: lng + offset * 0.5 });
  }
  points.push(destination);
  return points;
}

/**
 * Given a route and a progress %, return the interpolated position along the route.
 */
function interpolatePosition(route: WP[], progress: number): WP {
  if (progress <= 0) return route[0];
  if (progress >= 100) return route[route.length - 1];

  // Calculate total route distance
  const segDists: number[] = [];
  let totalDist = 0;
  for (let i = 1; i < route.length; i++) {
    const d = Math.sqrt(
      Math.pow(route[i].lat - route[i - 1].lat, 2) +
      Math.pow(route[i].lng - route[i - 1].lng, 2)
    );
    segDists.push(d);
    totalDist += d;
  }

  const targetDist = (progress / 100) * totalDist;
  let accumulated = 0;
  for (let i = 0; i < segDists.length; i++) {
    if (accumulated + segDists[i] >= targetDist) {
      const segProgress = (targetDist - accumulated) / segDists[i];
      return {
        lat: route[i].lat + (route[i + 1].lat - route[i].lat) * segProgress,
        lng: route[i].lng + (route[i + 1].lng - route[i].lng) * segProgress,
      };
    }
    accumulated += segDists[i];
  }
  return route[route.length - 1];
}

function createIcon(color: string, size: number, svg: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};width:${size}px;height:${size}px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.4);
    ">${svg}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const shipSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>`;

export function ShipmentMapView({ shipment, currentPosition: _cp, vesselHeading }: ShipmentMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

  // Build the realistic route
  const route = useMemo(
    () => buildShippingRoute(originCoords, destCoords, shipment.origin.port, shipment.destination.port),
    [originCoords, destCoords, shipment.origin.port, shipment.destination.port]
  );

  // Get vessel position along route
  const vesselPos = useMemo(() => interpolatePosition(route, progressPercent), [route, progressPercent]);

  // Split route into completed and remaining segments
  const { completedRoute, remainingRoute } = useMemo(() => {
    const completed: [number, number][] = [];
    const remaining: [number, number][] = [];
    const routeLatLngs = route.map(p => [p.lat, p.lng] as [number, number]);

    // Find where the vessel is on the route
    let totalDist = 0;
    const segDists: number[] = [];
    for (let i = 1; i < route.length; i++) {
      const d = Math.sqrt(
        Math.pow(route[i].lat - route[i - 1].lat, 2) +
        Math.pow(route[i].lng - route[i - 1].lng, 2)
      );
      segDists.push(d);
      totalDist += d;
    }

    const targetDist = (progressPercent / 100) * totalDist;
    let accumulated = 0;
    let vesselSegIdx = segDists.length - 1;

    for (let i = 0; i < segDists.length; i++) {
      if (accumulated + segDists[i] >= targetDist) {
        vesselSegIdx = i;
        break;
      }
      accumulated += segDists[i];
    }

    for (let i = 0; i <= vesselSegIdx; i++) {
      completed.push(routeLatLngs[i]);
    }
    completed.push([vesselPos.lat, vesselPos.lng]);

    remaining.push([vesselPos.lat, vesselPos.lng]);
    for (let i = vesselSegIdx + 1; i < route.length; i++) {
      remaining.push(routeLatLngs[i]);
    }

    return { completedRoute: completed, remainingRoute: remaining };
  }, [route, progressPercent, vesselPos]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [vesselPos.lat, vesselPos.lng],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite imagery
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    ).addTo(map);

    // Labels overlay
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
    ).addTo(map);

    // Completed route (solid blue)
    L.polyline(completedRoute, { color: "#3b82f6", weight: 3, opacity: 0.9 }).addTo(map);

    // Remaining route (dashed gray)
    L.polyline(remainingRoute, { color: "#94a3b8", weight: 2, opacity: 0.7, dashArray: "10, 8" }).addTo(map);

    // Origin marker
    L.marker([originCoords.lat, originCoords.lng], { icon: createIcon("#22c55e", 32, pinSvg) })
      .bindPopup(`<b>${shipment.origin.port.split(",")[0]}</b><br/>${shipment.origin.country} — Origin`)
      .addTo(map);

    // Destination marker
    L.marker([destCoords.lat, destCoords.lng], { icon: createIcon("#ef4444", 32, pinSvg) })
      .bindPopup(`<b>${shipment.destination.port.split(",")[0]}</b><br/>${shipment.destination.country} — Destination`)
      .addTo(map);

    // Vessel marker
    const vesselColor = shipment.status === "delayed" ? "#ef4444" : "#3b82f6";
    L.marker([vesselPos.lat, vesselPos.lng], { icon: createIcon(vesselColor, 40, shipSvg) })
      .bindPopup(`<b>${shipment.carrier.name}</b><br/>Container: ${shipment.containerId}<br/>Heading: ${vesselHeading}°`)
      .addTo(map);

    // Fit bounds to full route
    const allPoints = route.map(p => L.latLng(p.lat, p.lng));
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 5 });

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full z-0" />

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
