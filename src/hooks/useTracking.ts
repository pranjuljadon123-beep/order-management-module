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
  status: "delayed" | "active" | "on-time" | "completed";
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

export interface Incident {
  id: string;
  title: string;
  date: string;
  impactedCount: number;
  isRead: boolean;
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
    status: "active",
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
    status: "on-time",
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 1, total: 1 },
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
];

const mockIncidents: Incident[] = [
  {
    id: "1",
    title: "Severe Winter Storm Hits UK Shipping, Sends Containers Overboard",
    date: "10 Jan 2026",
    impactedCount: 86,
    isRead: false,
  },
  {
    id: "2",
    title: "Port Congestion at Rotterdam Causing 3-5 Day Delays",
    date: "08 Jan 2026",
    impactedCount: 42,
    isRead: false,
  },
];

export function useTracking() {
  // State
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
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

  // Computed values
  const filteredShipments = useMemo(() => {
    let result = [...shipments];

    // Apply shipment filter
    if (shipmentFilter !== "all") {
      result = result.filter((s) => {
        if (shipmentFilter === "in-transit") return s.status === "active";
        if (shipmentFilter === "completed") return s.status === "completed";
        if (shipmentFilter === "delayed") return s.status === "delayed";
        if (shipmentFilter === "yet-to-start") return s.status === "on-time" && !s.progress.origin;
        if (shipmentFilter === "archived") return false; // No archived status in current mock
        if (shipmentFilter === "invalid") return false; // No invalid status in current mock
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
      yetToStart: shipments.filter((s) => s.status === "on-time" && !s.progress.origin).length,
      inTransit: shipments.filter((s) => s.status === "active" || (s.status === "on-time" && s.progress.origin && !s.progress.destination)).length,
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
      status: "active",
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
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, isRead: true } : i))
    );
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
