import { useState, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const carriers = [
  { value: "mscu", label: "MSC Mediterranean Shipping Company", prefix: "MSCU" },
  { value: "maeu", label: "Maersk Line", prefix: "MAEU" },
  { value: "hlcu", label: "Hapag-Lloyd", prefix: "HLCU" },
  { value: "cmdu", label: "CMA CGM", prefix: "CMDU" },
  { value: "eglv", label: "Evergreen", prefix: "EGLV" },
  { value: "cosu", label: "COSCO", prefix: "COSU" },
  { value: "oolu", label: "OOCL", prefix: "OOLU" },
  { value: "ymlu", label: "Yang Ming", prefix: "YMLU" },
  { value: "one", label: "ONE (Ocean Network Express)", prefix: "ONEY" },
  { value: "zimu", label: "ZIM", prefix: "ZIMU" },
];

const modes = [
  { value: "ocean", label: "Ocean" },
  { value: "air", label: "Air" },
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
];

const clientGroups = [
  { value: "cg1", label: "Sales Demo Accounts CL531916" },
  { value: "cg2", label: "Enterprise Accounts" },
  { value: "cg3", label: "SMB Accounts" },
];

const consignees = [
  { value: "cons1", label: "Demo_Consignee_Nishan" },
  { value: "cons2", label: "Global Imports Ltd" },
  { value: "cons3", label: "Freight Solutions Inc" },
  { value: "cons4", label: "Pacific Trade Co" },
];

const ports = [
  { value: "CNSHA", label: "Shanghai, China (CNSHA)" },
  { value: "SGSIN", label: "Singapore (SGSIN)" },
  { value: "NLRTM", label: "Rotterdam, Netherlands (NLRTM)" },
  { value: "DEHAM", label: "Hamburg, Germany (DEHAM)" },
  { value: "USLAX", label: "Los Angeles, USA (USLAX)" },
  { value: "USNYC", label: "New York, USA (USNYC)" },
  { value: "INMAA", label: "Chennai, India (INMAA)" },
  { value: "VNHCM", label: "Ho Chi Minh, Vietnam (VNHCM)" },
  { value: "BEANR", label: "Antwerp, Belgium (BEANR)" },
];

interface AddShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddShipment: (containerId: string, carrier: string) => void;
}

export function AddShipmentDialog({ open, onOpenChange, onAddShipment }: AddShipmentDialogProps) {
  const [clientGroup, setClientGroup] = useState("");
  const [mode, setMode] = useState("ocean");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [factoryDispatchDate, setFactoryDispatchDate] = useState<Date>();
  const [consignee, setConsignee] = useState("");
  const [shareWith, setShareWith] = useState("");
  const [originPort, setOriginPort] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [isDetectingCarrier, setIsDetectingCarrier] = useState(false);

  // Auto-detect carrier from container number prefix
  useEffect(() => {
    if (containerNumber.length >= 4) {
      const prefix = containerNumber.substring(0, 4).toUpperCase();
      setIsDetectingCarrier(true);
      
      // Simulate detection delay
      const timer = setTimeout(() => {
        const detectedCarrier = carriers.find(c => c.prefix === prefix);
        if (detectedCarrier) {
          setCarrier(detectedCarrier.value);
          toast.success(`Carrier auto-detected: ${detectedCarrier.label}`);
        }
        setIsDetectingCarrier(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [containerNumber]);

  const handleSubmit = () => {
    if (!clientGroup) {
      toast.error("Please select a Client Group");
      return;
    }
    if (!containerNumber.trim()) {
      toast.error("Please enter a MBL/Container Number");
      return;
    }
    if (!carrier) {
      toast.error("Please select a Carrier");
      return;
    }

    onAddShipment(containerNumber.toUpperCase(), carrier);
    toast.success(`Shipment ${containerNumber.toUpperCase()} added for tracking`);
    
    // Reset form
    setClientGroup("");
    setMode("ocean");
    setReferenceNumber("");
    setContainerNumber("");
    setCarrier("");
    setFactoryDispatchDate(undefined);
    setConsignee("");
    setShareWith("");
    setOriginPort("");
    setDestinationPort("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Shipment</DialogTitle>
          <DialogDescription>
            Enter the shipment details to start tracking.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            {/* Client Group - Required */}
            <div className="space-y-2">
              <Label htmlFor="clientGroup" className="flex items-center gap-1">
                <span className="text-destructive">*</span> Client Group
              </Label>
              <Select value={clientGroup} onValueChange={setClientGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Client Group" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {clientGroups.map((cg) => (
                    <SelectItem key={cg.value} value={cg.value}>
                      {cg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode - Required */}
            <div className="space-y-2">
              <Label htmlFor="mode" className="flex items-center gap-1">
                <span className="text-destructive">*</span> Mode
              </Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {modes.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                placeholder="Enter reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            {/* MBL/Container Number - Required */}
            <div className="space-y-2">
              <Label htmlFor="containerNumber" className="flex items-center gap-1">
                <span className="text-destructive">*</span> MBL/Container Number
              </Label>
              <div className="relative">
                <Input
                  id="containerNumber"
                  placeholder="Enter MBL/Container Number"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                />
                {isDetectingCarrier && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Carrier will be auto-detected from container prefix
              </p>
            </div>

            {/* Carrier - Required */}
            <div className="space-y-2">
              <Label htmlFor="carrier" className="flex items-center gap-1">
                <span className="text-destructive">*</span> Carrier
              </Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Carrier" />
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

            {/* Factory Dispatch Date */}
            <div className="space-y-2">
              <Label>Factory Dispatch Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !factoryDispatchDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {factoryDispatchDate ? format(factoryDispatchDate, "PPP") : "Select Factory Dispatch Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={factoryDispatchDate}
                    onSelect={setFactoryDispatchDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Consignee Company Name */}
            <div className="space-y-2">
              <Label>Consignee Company Name</Label>
              <Select value={consignee} onValueChange={setConsignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Consignee" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {consignees.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Share with */}
            <div className="space-y-2">
              <Label>Share with</Label>
              <Input
                placeholder="Type to search company groups..."
                value={shareWith}
                onChange={(e) => setShareWith(e.target.value)}
              />
            </div>

            {/* Origin Port */}
            <div className="space-y-2">
              <Label>Origin [POL]</Label>
              <Select value={originPort} onValueChange={setOriginPort}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Origin Port" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {ports.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Port */}
            <div className="space-y-2">
              <Label>Destination [POD]</Label>
              <Select value={destinationPort} onValueChange={setDestinationPort}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Destination Port" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {ports.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
