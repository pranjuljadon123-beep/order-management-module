import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const carriers = [
  { value: "mscu", label: "MSCU - MSC" },
  { value: "maeu", label: "MAEU - Maersk" },
  { value: "hlcu", label: "HLCU - Hapag-Lloyd" },
  { value: "cmdu", label: "CMDU - CMA CGM" },
  { value: "eglv", label: "EGLV - Evergreen" },
  { value: "cosu", label: "COSU - COSCO" },
];

export function QuickAddShipment() {
  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        Quick Add Shipment
        <ArrowRight className="h-4 w-4" />
      </div>

      <Input 
        placeholder="B/L Number or Container Number" 
        className="flex-1 max-w-xs"
      />

      <Select>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Carrier" />
        </SelectTrigger>
        <SelectContent>
          {carriers.map((carrier) => (
            <SelectItem key={carrier.value} value={carrier.value}>
              {carrier.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button>Track Shipment</Button>

      <Button variant="outline">View All Integrations</Button>
    </div>
  );
}
