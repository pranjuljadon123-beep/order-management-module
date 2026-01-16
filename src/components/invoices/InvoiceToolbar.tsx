import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Download,
  Filter,
  FileDown,
  Search,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoiceToolbarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onDelete: () => void;
  onExport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function InvoiceToolbar({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onDelete,
  onExport,
  searchQuery,
  onSearchChange,
}: InvoiceToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected && totalCount > 0}
          onCheckedChange={onSelectAll}
          className="mr-1"
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={selectedCount === 0}
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-8">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>By Date Range</DropdownMenuItem>
            <DropdownMenuItem>By Vendor</DropdownMenuItem>
            <DropdownMenuItem>By Amount</DropdownMenuItem>
            <DropdownMenuItem>By Mode</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Badge variant="secondary" className="gap-1">
          <Info className="h-3 w-3" />
          {totalCount}
        </Badge>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <FileDown className="h-4 w-4" />
              Download Reports
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            <DropdownMenuItem>Download All Attachments</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
