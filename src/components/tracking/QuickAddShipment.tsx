import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
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

interface QuickAddShipmentProps {
  onAddShipment: (containerId: string, carrier: string) => void;
  onViewIntegrations: () => void;
}

export function QuickAddShipment({ onAddShipment, onViewIntegrations }: QuickAddShipmentProps) {
  const [containerId, setContainerId] = useState("");
  const [carrier, setCarrier] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackShipment = async () => {
    if (!containerId.trim()) {
      toast.error("Please enter a B/L Number or Container Number");
      return;
    }
    if (!carrier) {
      toast.error("Please select a carrier");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onAddShipment(containerId.trim().toUpperCase(), carrier);
    toast.success(`Shipment ${containerId.toUpperCase()} added successfully`);
    
    setContainerId("");
    setCarrier("");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-card border border-border rounded-lg px-3 sm:px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground flex-shrink-0">
        <span>Quick Add Shipment</span>
        <ArrowRight className="h-4 w-4 hidden sm:block" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
        <Input 
          placeholder="B/L Number or Container Number" 
          className="flex-1 min-w-0 sm:max-w-xs"
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrackShipment()}
        />

        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select Carrier" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {carriers.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleTrackShipment} 
          disabled={isLoading}
          className="flex-1 sm:flex-none"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Track Shipment
        </Button>

        <Button 
          variant="outline" 
          onClick={onViewIntegrations}
          className="flex-1 sm:flex-none"
        >
          <span className="hidden sm:inline">View All Integrations</span>
          <span className="sm:hidden">Integrations</span>
        </Button>
      </div>
    </div>
  );
}
