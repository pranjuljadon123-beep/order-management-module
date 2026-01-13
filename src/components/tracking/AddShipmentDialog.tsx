import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const carriers = [
  { value: "mscu", label: "MSC Mediterranean Shipping Company" },
  { value: "maeu", label: "Maersk Line" },
  { value: "hlcu", label: "Hapag-Lloyd" },
  { value: "cmdu", label: "CMA CGM" },
  { value: "eglv", label: "Evergreen" },
  { value: "cosu", label: "COSCO" },
];

interface AddShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddShipment: (containerId: string, carrier: string) => void;
}

export function AddShipmentDialog({ open, onOpenChange, onAddShipment }: AddShipmentDialogProps) {
  const [containerId, setContainerId] = useState("");
  const [blNumber, setBlNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  const handleSubmit = () => {
    const id = containerId.trim() || blNumber.trim();
    if (!id) {
      toast.error("Please enter a Container ID or B/L Number");
      return;
    }
    if (!carrier) {
      toast.error("Please select a carrier");
      return;
    }

    onAddShipment(id.toUpperCase(), carrier);
    toast.success(`Shipment ${id.toUpperCase()} added for tracking`);
    
    setContainerId("");
    setBlNumber("");
    setCarrier("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Shipment</DialogTitle>
          <DialogDescription>
            Enter the shipment details to start tracking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="containerId">Container ID</Label>
            <Input
              id="containerId"
              placeholder="e.g., MSCU1234567"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
            />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">OR</div>
          
          <div className="space-y-2">
            <Label htmlFor="blNumber">B/L Number</Label>
            <Input
              id="blNumber"
              placeholder="e.g., MSCUSHA123456"
              value={blNumber}
              onChange={(e) => setBlNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
