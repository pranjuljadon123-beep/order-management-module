import { useState, useCallback, useMemo } from "react";

export interface Shipment {
  id: string;
  containerId: string;
  rfNumber: string;
  carrier: string;
  carrierCode: string;
  origin: { city: string; country: string; flag: string };
  destination: { city: string; country: string; flag: string };
  consignee: string;
  carrierETA: string;
  prediction: { days: number; type: "early" | "late" | "on-time" };
  status: "delayed" | "active" | "completed" | "pending";
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

export type ViewMode = "list" | "grid" | "calendar";
export type TimeFilter = "24h" | "7d" | "30d" | "3m" | "6m" | "1y";
export type SortOption = "a-z" | "z-a" | "newest" | "oldest" | "eta-earliest" | "eta-latest";
export type ShipmentFilter = "all" | "in-transit" | "completed" | "delayed" | "pending";

const mockShipments: Shipment[] = [
  {
    id: "1",
    containerId: "CAIU7012639",
    rfNumber: "RF12345",
    carrier: "MSC Mediterranean Shipping Company",
    carrierCode: "MSCU",
    origin: { city: "Shanghai", country: "China", flag: "🇨🇳" },
    destination: { city: "Rotterdam", country: "Netherlands", flag: "🇳🇱" },
    consignee: "DELIGHT INTERNATIONAL FREIGHT FORWARDER LLC",
    carrierETA: "15 Jan 2026",
    prediction: { days: 2, type: "late" },
    status: "delayed",
    isNew: true,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 1, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    alert: "Vessel delay reported at Singapore port - Expected 2 days delay",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-13"),
  },
  {
    id: "2",
    containerId: "MSCU8234567",
    rfNumber: "RF12346",
    carrier: "Maersk Line",
    carrierCode: "MAEU",
    origin: { city: "Los Angeles", country: "USA", flag: "🇺🇸" },
    destination: { city: "Hamburg", country: "Germany", flag: "🇩🇪" },
    consignee: "EURO LOGISTICS GMBH",
    carrierETA: "20 Jan 2026",
    prediction: { days: 0, type: "on-time" },
    status: "active",
    isNew: false,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 2, total: 2 },
      destination: true,
      gateOut: false,
      emptyReturn: false,
    },
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-12"),
  },
  {
    id: "3",
    containerId: "HLCU9876543",
    rfNumber: "RF12347",
    carrier: "Hapag-Lloyd",
    carrierCode: "HLCU",
    origin: { city: "Mumbai", country: "India", flag: "🇮🇳" },
    destination: { city: "Felixstowe", country: "UK", flag: "🇬🇧" },
    consignee: "BRITISH IMPORTS LTD",
    carrierETA: "18 Jan 2026",
    prediction: { days: 1, type: "early" },
    status: "active",
    isNew: true,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 1, total: 1 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    createdAt: new Date("2026-01-08"),
    updatedAt: new Date("2026-01-13"),
  },
  {
    id: "4",
    containerId: "CMDU1122334",
    rfNumber: "RF12348",
    carrier: "CMA CGM",
    carrierCode: "CMDU",
    origin: { city: "Singapore", country: "Singapore", flag: "🇸🇬" },
    destination: { city: "Sydney", country: "Australia", flag: "🇦🇺" },
    consignee: "PACIFIC TRADE CO",
    carrierETA: "12 Jan 2026",
    prediction: { days: 0, type: "on-time" },
    status: "completed",
    isNew: false,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 1, total: 1 },
      destination: true,
      gateOut: true,
      emptyReturn: true,
    },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-12"),
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
        if (shipmentFilter === "pending") return s.status === "pending";
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
          s.rfNumber.toLowerCase().includes(query) ||
          s.carrier.toLowerCase().includes(query) ||
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
          return new Date(a.carrierETA).getTime() - new Date(b.carrierETA).getTime();
        case "eta-latest":
          return new Date(b.carrierETA).getTime() - new Date(a.carrierETA).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [shipments, shipmentFilter, showDelayed, showLast24Hours, searchQuery, timeFilter, sortOption]);

  const stats = useMemo(() => {
    return {
      all: shipments.length,
      inTransit: shipments.filter((s) => s.status === "active").length,
      completed: shipments.filter((s) => s.status === "completed").length,
      delayed: shipments.filter((s) => s.status === "delayed").length,
      pending: shipments.filter((s) => s.status === "pending").length,
      newDelays: shipments.filter((s) => s.status === "delayed" && s.isNew).length,
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
    const newShipment: Shipment = {
      id: Date.now().toString(),
      containerId,
      rfNumber: `RF${Math.floor(Math.random() * 100000)}`,
      carrier: carrier === "mscu" ? "MSC Mediterranean Shipping Company" : 
               carrier === "maeu" ? "Maersk Line" :
               carrier === "hlcu" ? "Hapag-Lloyd" :
               carrier === "cmdu" ? "CMA CGM" :
               carrier === "eglv" ? "Evergreen" : "COSCO",
      carrierCode: carrier.toUpperCase(),
      origin: { city: "Unknown", country: "Unknown", flag: "🌍" },
      destination: { city: "Unknown", country: "Unknown", flag: "🌍" },
      consignee: "TBD",
      carrierETA: "TBD",
      prediction: { days: 0, type: "on-time" },
      status: "pending",
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
    // In a real app, this would trigger a download
    console.log(`Exporting ${filteredShipments.length} shipments as ${format}`);
    // For now, we'll just log - this would be implemented with actual export logic
    const data = filteredShipments.map((s) => ({
      containerId: s.containerId,
      rfNumber: s.rfNumber,
      carrier: s.carrier,
      origin: `${s.origin.city}, ${s.origin.country}`,
      destination: `${s.destination.city}, ${s.destination.country}`,
      consignee: s.consignee,
      eta: s.carrierETA,
      status: s.status,
    }));
    
    if (format === "csv") {
      const headers = Object.keys(data[0] || {}).join(",");
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
