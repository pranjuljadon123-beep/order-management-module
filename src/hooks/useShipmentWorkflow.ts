import { useState, useMemo } from "react";

export type WorkflowStage = "booking" | "documentation" | "customs" | "loading" | "in_transit" | "delivery";
export type OwnerRole = "operations" | "documentation_compliance" | "unassigned";

export interface StageAssignment {
  stage: WorkflowStage;
  ownerRole: OwnerRole;
  ownerName: string;
  slaHours: number;
  enteredAt: string | null;
  completedAt: string | null;
  isCurrent: boolean;
}

export interface ShipmentWorkflow {
  id: string;
  shipmentNumber: string;
  title: string;
  customerName: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  mode: string;
  carrierName: string;
  currentStage: WorkflowStage;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  stages: StageAssignment[];
}

export const STAGES: { key: WorkflowStage; label: string; icon: string }[] = [
  { key: "booking", label: "Booking", icon: "📋" },
  { key: "documentation", label: "Documentation", icon: "📄" },
  { key: "customs", label: "Customs", icon: "🛃" },
  { key: "loading", label: "Loading", icon: "📦" },
  { key: "in_transit", label: "In Transit", icon: "🚢" },
  { key: "delivery", label: "Delivery", icon: "✅" },
];

const STAGE_INDEX: Record<WorkflowStage, number> = {
  booking: 0, documentation: 1, customs: 2, loading: 3, in_transit: 4, delivery: 5,
};

const OWNERS = [
  "Priya Sharma", "James Chen", "Maria Garcia", "Ahmed Hassan", "Sarah Johnson",
  "Raj Patel", "Lisa Wong", "David Miller",
];

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

function buildStages(currentStage: WorkflowStage): StageAssignment[] {
  const currentIdx = STAGE_INDEX[currentStage];
  return STAGES.map((s, i) => {
    const isCompleted = i < currentIdx;
    const isCurrent = i === currentIdx;
    const role: OwnerRole = (s.key === "documentation" || s.key === "customs")
      ? "documentation_compliance" : "operations";
    // Simulate time-in-stage for demo
    const slaHours = s.key === "booking" ? 12 : s.key === "documentation" ? 24 :
      s.key === "customs" ? 48 : s.key === "loading" ? 8 : s.key === "in_transit" ? 240 : 24;
    const enteredHoursAgo = isCurrent ? Math.floor(Math.random() * 60) + 2 : null;
    return {
      stage: s.key,
      ownerRole: role,
      ownerName: OWNERS[Math.floor(Math.random() * OWNERS.length)],
      slaHours,
      enteredAt: isCompleted ? hoursAgo(100 - i * 20) : isCurrent && enteredHoursAgo ? hoursAgo(enteredHoursAgo) : null,
      completedAt: isCompleted ? hoursAgo(80 - i * 15) : null,
      isCurrent,
    };
  });
}

const MOCK_WORKFLOWS: ShipmentWorkflow[] = [
  { id: "1", shipmentNumber: "SHP-2026-001", title: "Electronics Shipment - Samsung Parts", customerName: "Samsung Electronics", originCity: "Shanghai", originCountry: "China", destinationCity: "Los Angeles", destinationCountry: "United States", mode: "ocean", carrierName: "Maersk Line", currentStage: "documentation", priority: "high", createdAt: hoursAgo(72), stages: [] },
  { id: "2", shipmentNumber: "SHP-2026-002", title: "Auto Parts - BMW Assembly", customerName: "BMW AG", originCity: "Frankfurt", originCountry: "Germany", destinationCity: "Singapore", destinationCountry: "Singapore", mode: "air", carrierName: "Lufthansa Cargo", currentStage: "customs", priority: "normal", createdAt: hoursAgo(120), stages: [] },
  { id: "3", shipmentNumber: "SHP-2026-003", title: "Textile Shipment - H&M", customerName: "H&M Group", originCity: "Mumbai", originCountry: "India", destinationCity: "Dubai", destinationCountry: "UAE", mode: "ocean", carrierName: "MSC", currentStage: "booking", priority: "normal", createdAt: hoursAgo(8), stages: [] },
  { id: "4", shipmentNumber: "SHP-2026-004", title: "Pharma - Cold Chain", customerName: "Pfizer Inc", originCity: "Chicago", originCountry: "United States", destinationCity: "Toronto", destinationCountry: "Canada", mode: "road", carrierName: "XPO Logistics", currentStage: "loading", priority: "urgent", createdAt: hoursAgo(200), stages: [] },
  { id: "5", shipmentNumber: "SHP-2026-005", title: "Machinery Export", customerName: "Siemens AG", originCity: "Rotterdam", originCountry: "Netherlands", destinationCity: "New York", destinationCountry: "United States", mode: "ocean", carrierName: "Hapag-Lloyd", currentStage: "in_transit", priority: "normal", createdAt: hoursAgo(300), stages: [] },
  { id: "6", shipmentNumber: "SHP-2026-006", title: "Consumer Goods", customerName: "Unilever", originCity: "London", originCountry: "United Kingdom", destinationCity: "Lagos", destinationCountry: "Nigeria", mode: "ocean", carrierName: "CMA CGM", currentStage: "delivery", priority: "normal", createdAt: hoursAgo(400), stages: [] },
  { id: "7", shipmentNumber: "SHP-2026-007", title: "Steel Coils - TATA", customerName: "TATA Steel", originCity: "Jamshedpur", originCountry: "India", destinationCity: "Houston", destinationCountry: "United States", mode: "ocean", carrierName: "ONE Line", currentStage: "documentation", priority: "high", createdAt: hoursAgo(50), stages: [] },
  { id: "8", shipmentNumber: "SHP-2026-008", title: "Food Grade Oils", customerName: "Cargill", originCity: "Jakarta", originCountry: "Indonesia", destinationCity: "Amsterdam", destinationCountry: "Netherlands", mode: "ocean", carrierName: "Evergreen", currentStage: "customs", priority: "normal", createdAt: hoursAgo(150), stages: [] },
  { id: "9", shipmentNumber: "SHP-2026-009", title: "Automotive Parts", customerName: "Toyota Motor", originCity: "Nagoya", originCountry: "Japan", destinationCity: "Long Beach", destinationCountry: "United States", mode: "ocean", carrierName: "NYK Line", currentStage: "booking", priority: "low", createdAt: hoursAgo(4), stages: [] },
  { id: "10", shipmentNumber: "SHP-2026-010", title: "Chemical Shipment", customerName: "BASF SE", originCity: "Hamburg", originCountry: "Germany", destinationCity: "Shanghai", destinationCountry: "China", mode: "ocean", carrierName: "Hapag-Lloyd", currentStage: "in_transit", priority: "urgent", createdAt: hoursAgo(350), stages: [] },
].map(w => ({ ...w, stages: buildStages(w.currentStage) }));

export function getTimeInStage(enteredAt: string | null): { hours: number; label: string } {
  if (!enteredAt) return { hours: 0, label: "—" };
  const hours = Math.round((Date.now() - new Date(enteredAt).getTime()) / 3600000);
  if (hours < 1) return { hours, label: "< 1h" };
  if (hours < 24) return { hours, label: `${hours}h` };
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return { hours, label: `${days}d ${rem}h` };
}

export function getSlaStatus(hours: number, slaHours: number): "on-track" | "warning" | "breached" {
  const ratio = hours / slaHours;
  if (ratio >= 1) return "breached";
  if (ratio >= 0.75) return "warning";
  return "on-track";
}

export function useShipmentWorkflow() {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<WorkflowStage | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const workflows = MOCK_WORKFLOWS;

  const filtered = useMemo(() => {
    return workflows.filter(w => {
      if (stageFilter !== "all" && w.currentStage !== stageFilter) return false;
      if (priorityFilter !== "all" && w.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return w.shipmentNumber.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.customerName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [workflows, stageFilter, priorityFilter, searchQuery]);

  const stageGroups = useMemo(() => {
    const groups: Record<WorkflowStage, ShipmentWorkflow[]> = {
      booking: [], documentation: [], customs: [], loading: [], in_transit: [], delivery: [],
    };
    filtered.forEach(w => groups[w.currentStage].push(w));
    return groups;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = workflows.length;
    const breached = workflows.filter(w => {
      const current = w.stages.find(s => s.isCurrent);
      if (!current?.enteredAt) return false;
      const { hours } = getTimeInStage(current.enteredAt);
      return getSlaStatus(hours, current.slaHours) === "breached";
    }).length;
    const atRisk = workflows.filter(w => {
      const current = w.stages.find(s => s.isCurrent);
      if (!current?.enteredAt) return false;
      const { hours } = getTimeInStage(current.enteredAt);
      return getSlaStatus(hours, current.slaHours) === "warning";
    }).length;
    const urgent = workflows.filter(w => w.priority === "urgent").length;
    return { total, breached, atRisk, urgent };
  }, [workflows]);

  const bottlenecks = useMemo(() => {
    const stageBreaches: Record<WorkflowStage, number> = {
      booking: 0, documentation: 0, customs: 0, loading: 0, in_transit: 0, delivery: 0,
    };
    workflows.forEach(w => {
      const current = w.stages.find(s => s.isCurrent);
      if (!current?.enteredAt) return;
      const { hours } = getTimeInStage(current.enteredAt);
      if (getSlaStatus(hours, current.slaHours) !== "on-track") {
        stageBreaches[w.currentStage]++;
      }
    });
    return stageBreaches;
  }, [workflows]);

  return {
    viewMode, setViewMode,
    searchQuery, setSearchQuery,
    stageFilter, setStageFilter,
    priorityFilter, setPriorityFilter,
    workflows: filtered,
    stageGroups,
    stats,
    bottlenecks,
  };
}
