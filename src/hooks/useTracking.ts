import { useState, useCallback, useMemo } from "react";
import type { ViewMode, ShipmentFilter } from "@/components/tracking/TrackingSidebar";

export interface Shipment {
  id: string;
  containerId: string;
  rfNumber?: string;
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
  status: "yet-to-start" | "in-transit" | "delayed" | "completed";
  isNew: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

export type IncidentCategory = "weather" | "conflict" | "port-congestion" | "labor-strike" | "geopolitical" | "infrastructure" | "piracy" | "pandemic";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export interface Incident {
  id: string;
  title: string;
  description: string;
  date: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  affectedRegions: string[]; // Country codes or region names
  affectedPorts: string[];
  affectedRoutes: string[]; // e.g., "Asia-Europe", "Trans-Pacific"
  impactedCount: number;
  impactedShipmentIds: string[];
  source: string;
  sourceUrl?: string;
  isRead: boolean;
  estimatedDelayDays?: number;
}

export type TimeFilter = "24h" | "7d" | "30d" | "3m" | "6m" | "1y";
export type SortOption = "a-z" | "z-a" | "newest" | "oldest" | "eta-earliest" | "eta-latest";

const mockShipments: Shipment[] = [
  {
    id: "1",
    containerId: "TRHU6873407",
    rfNumber: undefined,
    carrier: { code: "MSCU", name: "MSC" },
    origin: { port: "Ennore, India, INENR", country: "India", countryCode: "IN" },
    destination: { port: "Chicago, USA, USCHI", country: "USA", countryCode: "US" },
    consignee: "Demo_Con...",
    carrierEta: undefined,
    prediction: { daysLate: 13 },
    status: "in-transit",
    isNew: true,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    alert: "Carrier ETA Delayed by 1 day for New York, US. Old Carrier ETA: 2026-02-13 to New Carrier ETA: 2026-02-14.",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-13"),
  },
  {
    id: "2",
    containerId: "MEDUKJ783019",
    rfNumber: undefined,
    carrier: { code: "MSCU", name: "MSC" },
    origin: { port: "Rotterdam, Netherlands", country: "Netherlands", countryCode: "NL" },
    destination: { port: "Kampala, Uganda, UGKL", country: "Uganda", countryCode: "UG" },
    consignee: "Demo_Con...",
    carrierEta: undefined,
    prediction: { daysLate: 11 },
    status: "in-transit",
    isNew: true,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    alert: "Carrier ETA Pre-poned by 1 day for Mombasa, KE. Old Carrier ETA: 2026-03-14 to New Carrier ETA: 2026-03-13.",
    createdAt: new Date("2026-01-08"),
    updatedAt: new Date("2026-01-13"),
  },
  {
    id: "3",
    containerId: "CXRU1542167",
    rfNumber: undefined,
    carrier: { code: "MSCU", name: "MSC" },
    origin: { port: "JNPT (Nhava Sheva), Mumbai", country: "India", countryCode: "IN" },
    destination: { port: "New York, USA, USNYC", country: "USA", countryCode: "US" },
    consignee: "Demo_Con...",
    carrierEta: "09 Feb 2026",
    prediction: { daysLate: 2 },
    status: "delayed",
    isNew: true,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-12"),
  },
  {
    id: "4",
    containerId: "HLBU2847592",
    rfNumber: "RF-2026-001",
    carrier: { code: "HLCU", name: "Hapag-Lloyd" },
    origin: { port: "Shanghai, China", country: "China", countryCode: "CN" },
    destination: { port: "Hamburg, Germany", country: "Germany", countryCode: "DE" },
    consignee: "Freight_Co...",
    carrierEta: "15 Feb 2026",
    prediction: { daysLate: 0 },
    status: "yet-to-start",
    progress: {
      emptyPickup: false,
      gateIn: false,
      origin: false,
      transhipment: { current: 0, total: 1 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    isNew: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-10"),
  },
  {
    id: "5",
    containerId: "EGLV3948271",
    rfNumber: "RF-2026-002",
    carrier: { code: "EGLV", name: "Evergreen" },
    origin: { port: "Singapore", country: "Singapore", countryCode: "SG" },
    destination: { port: "Dubai, UAE", country: "UAE", countryCode: "AE" },
    consignee: "Global_Im...",
    carrierEta: "20 Jan 2026",
    prediction: { daysLate: 0 },
    status: "completed",
    isNew: false,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 0 },
      destination: true,
      gateOut: true,
      emptyReturn: true,
    },
    createdAt: new Date("2025-12-15"),
    updatedAt: new Date("2026-01-09"),
  },
  {
    id: "6",
    containerId: "OOLU9283746",
    rfNumber: "RF-2026-003",
    carrier: { code: "OOLU", name: "OOCL" },
    origin: { port: "Busan, South Korea", country: "South Korea", countryCode: "KR" },
    destination: { port: "Los Angeles, USA", country: "USA", countryCode: "US" },
    consignee: "West_Coast...",
    carrierEta: "28 Jan 2026",
    prediction: { daysLate: 0 },
    status: "yet-to-start",
    isNew: false,
    progress: {
      emptyPickup: false,
      gateIn: false,
      origin: false,
      transhipment: { current: 0, total: 0 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-01-13"),
  },
];

// Global news incidents that can affect shipments
const mockGlobalIncidents: Incident[] = [
  {
    id: "inc-1",
    title: "Red Sea Crisis: Houthi Attacks Force Ships to Reroute via Cape of Good Hope",
    description: "Ongoing Houthi rebel attacks on commercial vessels in the Red Sea have forced major shipping lines to divert around Africa, adding 10-14 days to Asia-Europe routes. Insurance costs have surged 300%.",
    date: "18 Jan 2026",
    category: "conflict",
    severity: "critical",
    affectedRegions: ["YE", "SA", "EG", "DJ", "ER"],
    affectedPorts: ["Jeddah", "Aden", "Djibouti", "Port Said", "Suez"],
    affectedRoutes: ["Asia-Europe", "Asia-Mediterranean", "Indian Ocean"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    isRead: false,
    estimatedDelayDays: 12,
  },
  {
    id: "inc-2",
    title: "Severe Winter Storm Hits Northern Europe, Port Operations Suspended",
    description: "Storm Éowyn has caused widespread disruption across UK and Northern European ports. Hamburg and Rotterdam have suspended operations for 48 hours due to dangerous wind conditions.",
    date: "17 Jan 2026",
    category: "weather",
    severity: "high",
    affectedRegions: ["DE", "NL", "GB", "BE", "DK"],
    affectedPorts: ["Rotterdam", "Hamburg", "Antwerp", "Felixstowe", "Southampton"],
    affectedRoutes: ["Trans-Atlantic", "Asia-Europe"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "BBC News",
    sourceUrl: "https://bbc.com",
    isRead: false,
    estimatedDelayDays: 3,
  },
  {
    id: "inc-3",
    title: "Panama Canal Drought: Transit Slots Reduced by 40%",
    description: "Unprecedented drought conditions have lowered water levels in Gatun Lake, forcing the Panama Canal Authority to reduce daily vessel transits from 36 to 22. Wait times have extended to 21 days.",
    date: "15 Jan 2026",
    category: "infrastructure",
    severity: "critical",
    affectedRegions: ["PA", "US", "CN", "JP", "KR"],
    affectedPorts: ["Panama City", "Colon", "Los Angeles", "Long Beach", "New York"],
    affectedRoutes: ["Trans-Pacific", "Asia-US East Coast"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "Wall Street Journal",
    sourceUrl: "https://wsj.com",
    isRead: false,
    estimatedDelayDays: 7,
  },
  {
    id: "inc-4",
    title: "Dockworkers Strike at US West Coast Ports",
    description: "ILWU union members have initiated work stoppages at major West Coast ports including Los Angeles, Long Beach, and Oakland. Negotiations over automation remain stalled.",
    date: "14 Jan 2026",
    category: "labor-strike",
    severity: "high",
    affectedRegions: ["US"],
    affectedPorts: ["Los Angeles", "Long Beach", "Oakland", "Seattle", "Tacoma"],
    affectedRoutes: ["Trans-Pacific", "Asia-Americas"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    isRead: false,
    estimatedDelayDays: 5,
  },
  {
    id: "inc-5",
    title: "China-Taiwan Tensions: Shipping Insurance Premiums Spike",
    description: "Escalating military exercises near Taiwan have caused marine insurance premiums to increase by 150% for Taiwan Strait transits. Some carriers are considering alternative routes.",
    date: "12 Jan 2026",
    category: "geopolitical",
    severity: "medium",
    affectedRegions: ["CN", "TW", "JP", "KR"],
    affectedPorts: ["Shanghai", "Ningbo", "Kaohsiung", "Taipei"],
    affectedRoutes: ["Intra-Asia", "Trans-Pacific"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    isRead: false,
    estimatedDelayDays: 2,
  },
  {
    id: "inc-6",
    title: "Piracy Alert: Gulf of Guinea Attacks Increase",
    description: "Maritime security reports indicate a 40% increase in piracy incidents off the West African coast. Armed guards are now recommended for vessels transiting the region.",
    date: "10 Jan 2026",
    category: "piracy",
    severity: "medium",
    affectedRegions: ["NG", "GH", "CI", "TG", "BJ"],
    affectedPorts: ["Lagos", "Tema", "Abidjan", "Lome", "Cotonou"],
    affectedRoutes: ["Europe-West Africa", "Americas-West Africa"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "IMB Piracy Reporting Centre",
    sourceUrl: "https://icc-ccs.org",
    isRead: false,
    estimatedDelayDays: 1,
  },
  {
    id: "inc-7",
    title: "Singapore Port Congestion: Vessel Waiting Times at 7 Days",
    description: "Record container volumes and yard congestion at Port of Singapore have pushed vessel waiting times to 7 days. The port is implementing emergency measures to clear backlogs.",
    date: "08 Jan 2026",
    category: "port-congestion",
    severity: "high",
    affectedRegions: ["SG", "MY", "ID"],
    affectedPorts: ["Singapore", "Port Klang", "Tanjung Pelepas"],
    affectedRoutes: ["Intra-Asia", "Asia-Europe", "Asia-Oceania"],
    impactedCount: 0,
    impactedShipmentIds: [],
    source: "Lloyd's List",
    sourceUrl: "https://lloydslist.com",
    isRead: false,
    estimatedDelayDays: 4,
  },
];

// Helper to match incidents to shipments
function matchIncidentsToShipments(incidents: Incident[], shipments: Shipment[]): Incident[] {
  return incidents.map(incident => {
    const impactedShipmentIds: string[] = [];
    
    shipments.forEach(shipment => {
      // Check if shipment origin/destination matches affected regions
      const originMatch = incident.affectedRegions.includes(shipment.origin.countryCode) ||
        incident.affectedPorts.some(port => 
          shipment.origin.port.toLowerCase().includes(port.toLowerCase())
        );
      
      const destMatch = incident.affectedRegions.includes(shipment.destination.countryCode) ||
        incident.affectedPorts.some(port => 
          shipment.destination.port.toLowerCase().includes(port.toLowerCase())
        );
      
      // Check route matches (simplified matching)
      const routeMatch = incident.affectedRoutes.some(route => {
        const routeLower = route.toLowerCase();
        const originCountry = shipment.origin.country.toLowerCase();
        const destCountry = shipment.destination.country.toLowerCase();
        
        if (routeLower.includes("asia") && (originCountry.includes("india") || originCountry.includes("china") || originCountry.includes("singapore") || originCountry.includes("korea"))) return true;
        if (routeLower.includes("europe") && (destCountry.includes("germany") || destCountry.includes("netherlands") || originCountry.includes("netherlands"))) return true;
        if (routeLower.includes("trans-pacific") && (destCountry.includes("usa") || destCountry.includes("us"))) return true;
        if (routeLower.includes("trans-atlantic") && (destCountry.includes("usa") || destCountry.includes("us"))) return true;
        
        return false;
      });
      
      if ((originMatch || destMatch || routeMatch) && shipment.status !== "completed") {
        impactedShipmentIds.push(shipment.id);
      }
    });
    
    return {
      ...incident,
      impactedShipmentIds,
      impactedCount: impactedShipmentIds.length,
    };
  }).filter(incident => incident.impactedCount > 0);
}

export function useTracking() {
  // State
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("3m");
  const [shipmentFilter, setShipmentFilter] = useState<ShipmentFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("z-a");
  const [showDelayed, setShowDelayed] = useState(false);
  const [showLast24Hours, setShowLast24Hours] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dismissedIncidentIds, setDismissedIncidentIds] = useState<string[]>([]);

  // Compute incidents matched to current shipments
  const incidents = useMemo(() => {
    const matched = matchIncidentsToShipments(mockGlobalIncidents, shipments);
    return matched.map(inc => ({
      ...inc,
      isRead: dismissedIncidentIds.includes(inc.id),
    }));
  }, [shipments, dismissedIncidentIds]);

  // Computed values
  const filteredShipments = useMemo(() => {
    let result = [...shipments];

    // Apply shipment filter
    if (shipmentFilter !== "all") {
      result = result.filter((s) => {
        if (shipmentFilter === "in-transit") return s.status === "in-transit";
        if (shipmentFilter === "completed") return s.status === "completed";
        if (shipmentFilter === "delayed") return s.status === "delayed";
        if (shipmentFilter === "yet-to-start") return s.status === "yet-to-start";
        if (shipmentFilter === "archived") return false;
        if (shipmentFilter === "invalid") return false;
        if (shipmentFilter === "action-required") return !!s.alert;
        return true;
      });
    }

    // Apply delayed filter
    if (showDelayed) {
      result = result.filter((s) => s.status === "delayed");
    }

    // Apply last 24 hours filter
    if (showLast24Hours) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      result = result.filter((s) => s.updatedAt >= yesterday);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.containerId.toLowerCase().includes(query) ||
          (s.rfNumber && s.rfNumber.toLowerCase().includes(query)) ||
          s.carrier.name.toLowerCase().includes(query) ||
          s.consignee.toLowerCase().includes(query)
      );
    }

    // Apply time filter
    const now = new Date();
    const filterDays: Record<TimeFilter, number> = {
      "24h": 1,
      "7d": 7,
      "30d": 30,
      "3m": 90,
      "6m": 180,
      "1y": 365,
    };
    const cutoffDate = new Date(now.getTime() - filterDays[timeFilter] * 24 * 60 * 60 * 1000);
    result = result.filter((s) => s.createdAt >= cutoffDate);

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "a-z":
          return a.containerId.localeCompare(b.containerId);
        case "z-a":
          return b.containerId.localeCompare(a.containerId);
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "eta-earliest":
          return (a.carrierEta || "").localeCompare(b.carrierEta || "");
        case "eta-latest":
          return (b.carrierEta || "").localeCompare(a.carrierEta || "");
        default:
          return 0;
      }
    });

    return result;
  }, [shipments, shipmentFilter, showDelayed, showLast24Hours, searchQuery, timeFilter, sortOption]);

  const stats = useMemo(() => {
    return {
      all: shipments.length,
      yetToStart: shipments.filter((s) => s.status === "yet-to-start").length,
      inTransit: shipments.filter((s) => s.status === "in-transit").length,
      completed: shipments.filter((s) => s.status === "completed").length,
      archived: 0,
      invalid: 0,
      actionRequired: shipments.filter((s) => !!s.alert).length,
      delayed: shipments.filter((s) => s.status === "delayed").length,
    };
  }, [shipments]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (shipmentFilter !== "all") count++;
    if (showDelayed) count++;
    if (showLast24Hours) count++;
    if (searchQuery) count++;
    return count;
  }, [shipmentFilter, showDelayed, showLast24Hours, searchQuery]);

  const unreadIncidents = useMemo(() => {
    return incidents.filter((i) => !i.isRead);
  }, [incidents]);

  // Actions
  const addShipment = useCallback((containerId: string, carrier: string) => {
    const carrierMap: Record<string, { code: string; name: string }> = {
      mscu: { code: "MSCU", name: "MSC Mediterranean Shipping Company" },
      maeu: { code: "MAEU", name: "Maersk Line" },
      hlcu: { code: "HLCU", name: "Hapag-Lloyd" },
      cmdu: { code: "CMDU", name: "CMA CGM" },
      eglv: { code: "EGLV", name: "Evergreen" },
      cosu: { code: "COSU", name: "COSCO" },
    };

    const newShipment: Shipment = {
      id: Date.now().toString(),
      containerId,
      rfNumber: `RF${Math.floor(Math.random() * 100000)}`,
      carrier: carrierMap[carrier] || { code: carrier.toUpperCase(), name: carrier },
      origin: { port: "Unknown", country: "Unknown", countryCode: "XX" },
      destination: { port: "Unknown", country: "Unknown", countryCode: "XX" },
      consignee: "TBD",
      carrierEta: undefined,
      prediction: { daysLate: 0 },
      status: "yet-to-start",
      isNew: true,
      progress: {
        emptyPickup: false,
        gateIn: false,
        origin: false,
        transhipment: { current: 0, total: 0 },
        destination: false,
        gateOut: false,
        emptyReturn: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setShipments((prev) => [newShipment, ...prev]);
    return newShipment;
  }, []);

  const markAlertAsRead = useCallback((shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, alert: undefined } : s))
    );
  }, []);

  const markIncidentAsRead = useCallback((incidentId: string) => {
    setDismissedIncidentIds((prev) => [...prev, incidentId]);
  }, []);

  const resetFilters = useCallback(() => {
    setShipmentFilter("all");
    setShowDelayed(false);
    setShowLast24Hours(false);
    setSearchQuery("");
    setTimeFilter("3m");
    setSortOption("z-a");
  }, []);

  const exportData = useCallback((format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting ${filteredShipments.length} shipments as ${format}`);
    const data = filteredShipments.map((s) => ({
      containerId: s.containerId,
      rfNumber: s.rfNumber || "",
      carrier: s.carrier.name,
      origin: `${s.origin.port}, ${s.origin.country}`,
      destination: `${s.destination.port}, ${s.destination.country}`,
      consignee: s.consignee,
      eta: s.carrierEta || "N/A",
      status: s.status,
    }));
    
    if (format === "csv" && data.length > 0) {
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((row) => Object.values(row).join(",")).join("\n");
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shipments-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [filteredShipments]);

  return {
    // State
    shipments: filteredShipments,
    allShipments: shipments,
    incidents,
    unreadIncidents,
    viewMode,
    timeFilter,
    shipmentFilter,
    sortOption,
    showDelayed,
    showLast24Hours,
    searchQuery,
    selectedShipment,
    isAddShipmentOpen,
    isBulkUploadOpen,
    sidebarCollapsed,
    stats,
    activeFiltersCount,
    
    // Setters
    setViewMode,
    setTimeFilter,
    setShipmentFilter,
    setSortOption,
    setShowDelayed,
    setShowLast24Hours,
    setSearchQuery,
    setSelectedShipment,
    setIsAddShipmentOpen,
    setIsBulkUploadOpen,
    setSidebarCollapsed,
    
    // Actions
    addShipment,
    markAlertAsRead,
    markIncidentAsRead,
    resetFilters,
    exportData,
  };
}
