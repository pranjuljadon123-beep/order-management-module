import { 
  Plus, 
  ChevronDown, 
  Filter, 
  RotateCcw,
  ArrowDownAZ,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TrackingHeader() {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Left Side - Actions */}
      <div className="flex items-center gap-3">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Shipment
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Last 3 Months
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Last 24 Hours</DropdownMenuItem>
            <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
            <DropdownMenuItem>Last 6 Months</DropdownMenuItem>
            <DropdownMenuItem>Last Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
            1
          </Badge>
        </Button>

        <Button variant="ghost" className="gap-2 text-muted-foreground">
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>

        <div className="flex items-center gap-4 ml-4">
          <div className="flex items-center gap-2">
            <Checkbox id="delayed" />
            <label htmlFor="delayed" className="text-sm text-muted-foreground cursor-pointer">
              Delayed
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="last24" />
            <label htmlFor="last24" className="text-sm text-muted-foreground cursor-pointer">
              Last 24 Hours
            </label>
          </div>
        </div>
      </div>

      {/* Right Side - Sort & Download */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowDownAZ className="h-4 w-4" />
              Sort: Z - A
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>A - Z</DropdownMenuItem>
            <DropdownMenuItem>Z - A</DropdownMenuItem>
            <DropdownMenuItem>Newest First</DropdownMenuItem>
            <DropdownMenuItem>Oldest First</DropdownMenuItem>
            <DropdownMenuItem>ETA (Earliest)</DropdownMenuItem>
            <DropdownMenuItem>ETA (Latest)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Reports
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
