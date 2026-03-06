import { Search, LayoutGrid, Table2, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAGES, type WorkflowStage } from "@/hooks/useShipmentWorkflow";
import { cn } from "@/lib/utils";

interface WorkflowToolbarProps {
  viewMode: "kanban" | "table";
  setViewMode: (v: "kanban" | "table") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  stageFilter: WorkflowStage | "all";
  setStageFilter: (s: WorkflowStage | "all") => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
}

export function WorkflowToolbar({
  viewMode, setViewMode,
  searchQuery, setSearchQuery,
  stageFilter, setStageFilter,
  priorityFilter, setPriorityFilter,
}: WorkflowToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 elegant-input"
          />
        </div>
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as WorkflowStage | "all")}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map(s => (
              <SelectItem key={s.key} value={s.key}>{s.icon} {s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">🔴 Urgent</SelectItem>
            <SelectItem value="high">🟠 High</SelectItem>
            <SelectItem value="normal">🟢 Normal</SelectItem>
            <SelectItem value="low">⚪ Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-3 gap-1.5 rounded-md", viewMode === "kanban" && "bg-background shadow-sm")}
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-3 gap-1.5 rounded-md", viewMode === "table" && "bg-background shadow-sm")}
            onClick={() => setViewMode("table")}
          >
            <Table2 className="h-4 w-4" />
            Table
          </Button>
        </div>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Shipment
        </Button>
      </div>
    </div>
  );
}
