import { useState } from "react";
import { Filter, Calendar, Globe, Truck, Ship, Plane, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DashboardFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange: string;
  transportMode: string;
  region: string;
  carrier: string;
}

const dateRanges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
  { value: "custom", label: "Custom range" },
];

const transportModes = [
  { value: "all", label: "All Modes", icon: null },
  { value: "ocean", label: "Ocean", icon: Ship },
  { value: "air", label: "Air", icon: Plane },
  { value: "road", label: "Road", icon: Truck },
];

const regions = [
  { value: "all", label: "All Regions" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "middle-east", label: "Middle East" },
  { value: "africa", label: "Africa" },
];

const carriers = [
  { value: "all", label: "All Carriers" },
  { value: "maersk", label: "Maersk" },
  { value: "msc", label: "MSC" },
  { value: "cosco", label: "COSCO" },
  { value: "hapag-lloyd", label: "Hapag-Lloyd" },
  { value: "evergreen", label: "Evergreen" },
];

export function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "30d",
    transportMode: "all",
    region: "all",
    carrier: "all",
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== "all" && value !== "30d"
  ).length;

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      dateRange: "30d",
      transportMode: "all",
      region: "all",
      carrier: "all",
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const SelectedModeIcon = transportModes.find(m => m.value === filters.transportMode)?.icon;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date Range */}
      <Select value={filters.dateRange} onValueChange={(v) => updateFilter("dateRange", v)}>
        <SelectTrigger className="w-[160px] bg-card border-border">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          {dateRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Transport Mode */}
      <Select value={filters.transportMode} onValueChange={(v) => updateFilter("transportMode", v)}>
        <SelectTrigger className="w-[140px] bg-card border-border">
          {SelectedModeIcon ? (
            <SelectedModeIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <SelectValue placeholder="Mode" />
        </SelectTrigger>
        <SelectContent>
          {transportModes.map((mode) => (
            <SelectItem key={mode.value} value={mode.value}>
              <div className="flex items-center gap-2">
                {mode.icon && <mode.icon className="h-4 w-4" />}
                {mode.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Region */}
      <Select value={filters.region} onValueChange={(v) => updateFilter("region", v)}>
        <SelectTrigger className="w-[160px] bg-card border-border">
          <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Carrier */}
      <Select value={filters.carrier} onValueChange={(v) => updateFilter("carrier", v)}>
        <SelectTrigger className="w-[160px] bg-card border-border">
          <Ship className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Carrier" />
        </SelectTrigger>
        <SelectContent>
          {carriers.map((carrier) => (
            <SelectItem key={carrier.value} value={carrier.value}>
              {carrier.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Filters Badge & Reset */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Filter className="h-3 w-3" />
            {activeFilterCount} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
