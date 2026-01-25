import { 
  Plus, 
  ChevronDown, 
  Filter, 
  RotateCcw,
  ArrowDownAZ,
  ArrowUpAZ,
  Download,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { TimeFilter, SortOption } from "@/hooks/useTracking";

interface TrackingHeaderProps {
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  showDelayed: boolean;
  setShowDelayed: (show: boolean) => void;
  showLast24Hours: boolean;
  setShowLast24Hours: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  onAddShipment: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
}

const timeFilterLabels: Record<TimeFilter, string> = {
  "24h": "Last 24 Hours",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "3m": "Last 3 Months",
  "6m": "Last 6 Months",
  "1y": "Last Year",
};

const sortOptionLabels: Record<SortOption, string> = {
  "a-z": "A - Z",
  "z-a": "Z - A",
  "newest": "Newest First",
  "oldest": "Oldest First",
  "eta-earliest": "ETA (Earliest)",
  "eta-latest": "ETA (Latest)",
};

export function TrackingHeader({
  timeFilter,
  setTimeFilter,
  sortOption,
  setSortOption,
  showDelayed,
  setShowDelayed,
  showLast24Hours,
  setShowLast24Hours,
  searchQuery,
  setSearchQuery,
  activeFiltersCount,
  onResetFilters,
  onAddShipment,
  onExport,
}: TrackingHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Row - Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left Side - Primary Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button className="gap-2" onClick={onAddShipment}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Shipment</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span className="hidden sm:inline">{timeFilterLabels[timeFilter]}</span>
                <span className="sm:hidden">Time</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover">
              {(Object.keys(timeFilterLabels) as TimeFilter[]).map((key) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => setTimeFilter(key)}
                  className={timeFilter === key ? "bg-accent" : ""}
                >
                  {timeFilterLabels[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"} 
            className="gap-2"
            onClick={() => {
              // Toggle delayed filter as a quick filter action
              setShowDelayed(!showDelayed);
            }}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              className="gap-2 text-muted-foreground"
              onClick={onResetFilters}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset Filters</span>
            </Button>
          )}
        </div>

        {/* Right Side - Sort & Download */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {sortOption.startsWith("a") || sortOption === "oldest" || sortOption === "eta-earliest" ? (
                  <ArrowDownAZ className="h-4 w-4" />
                ) : (
                  <ArrowUpAZ className="h-4 w-4" />
                )}
                <span className="hidden md:inline">Sort: {sortOptionLabels[sortOption]}</span>
                <span className="md:hidden">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              {(Object.keys(sortOptionLabels) as SortOption[]).map((key) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => setSortOption(key)}
                  className={sortOption === key ? "bg-accent" : ""}
                >
                  {sortOptionLabels[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Download Reports</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Row - Search & Quick Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Container ID, RF#, Carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              id="delayed" 
              checked={showDelayed}
              onCheckedChange={(checked) => setShowDelayed(checked === true)}
            />
            <span className="text-sm text-muted-foreground">Delayed</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              id="last24" 
              checked={showLast24Hours}
              onCheckedChange={(checked) => setShowLast24Hours(checked === true)}
            />
            <span className="text-sm text-muted-foreground">Last 24 Hours</span>
          </label>
        </div>
      </div>
    </div>
  );
}
