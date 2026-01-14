import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Star,
  RefreshCw,
  Flag,
  Share2,
  Ship,
  MapPin,
  CheckCircle2,
  Circle,
  Loader2,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/hooks/useTracking";

interface Milestone {
  id: string;
  name: string;
  location: string;
  plannedDate: string;
  actualDate?: string;
  status: "completed" | "current" | "pending";
}

interface ShipmentDetailViewProps {
  shipment: Shipment;
  onBack: () => void;
}

export function ShipmentDetailView({ shipment, onBack }: ShipmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState("map");

  // Generate milestones based on shipment data
  const milestones: Milestone[] = [
    {
      id: "1",
      name: "Empty Pickup",
      location: `Container Depot, ${shipment.origin.port}`,
      plannedDate: "20 Nov 2025",
      actualDate: shipment.progress.emptyPickup ? "20 Nov 2025" : undefined,
      status: shipment.progress.emptyPickup ? "completed" : "pending",
    },
    {
      id: "2",
      name: "Gate In",
      location: `${shipment.origin.port}, ${shipment.origin.country}`,
      plannedDate: "23 Nov 2025",
      actualDate: shipment.progress.gateIn ? "23 Nov 2025" : undefined,
      status: shipment.progress.gateIn ? "completed" : "pending",
    },
    {
      id: "3",
      name: "Origin Departure",
      location: `${shipment.origin.port}, ${shipment.origin.country}`,
      plannedDate: "27 Nov 2025",
      actualDate: shipment.progress.origin ? "27 Nov 2025" : undefined,
      status: shipment.progress.origin ? "completed" : "pending",
    },
    {
      id: "4",
      name: "Trans Shipment Arrival",
      location: "Singapore",
      plannedDate: "30 Nov 2025",
      actualDate: shipment.progress.transhipment.current >= 1 ? "30 Nov 2025" : undefined,
      status: shipment.progress.transhipment.current >= 1 ? "completed" : 
              shipment.progress.origin && shipment.progress.transhipment.total > 0 ? "current" : "pending",
    },
    {
      id: "5",
      name: "Trans Shipment Departure",
      location: "Singapore",
      plannedDate: "03 Dec 2025",
      actualDate: shipment.progress.transhipment.current >= shipment.progress.transhipment.total ? "03 Dec 2025" : undefined,
      status: shipment.progress.transhipment.current >= shipment.progress.transhipment.total && shipment.progress.transhipment.total > 0 ? "completed" : 
              shipment.progress.transhipment.current >= 1 ? "current" : "pending",
    },
    {
      id: "6",
      name: "Arrival",
      location: `${shipment.destination.port}, ${shipment.destination.country}`,
      plannedDate: shipment.carrierEta || "22 Jan 2026",
      actualDate: shipment.progress.destination ? shipment.carrierEta : undefined,
      status: shipment.progress.destination ? "completed" : 
              shipment.progress.transhipment.current >= shipment.progress.transhipment.total ? "current" : "pending",
    },
    {
      id: "7",
      name: "Gate Out",
      location: `${shipment.destination.port}, ${shipment.destination.country}`,
      plannedDate: "--",
      actualDate: shipment.progress.gateOut ? "--" : undefined,
      status: shipment.progress.gateOut ? "completed" : "pending",
    },
    {
      id: "8",
      name: "Empty Return",
      location: "THORNTON NV",
      plannedDate: "--",
      actualDate: shipment.progress.emptyReturn ? "--" : undefined,
      status: shipment.progress.emptyReturn ? "completed" : "pending",
    },
  ];

  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "current":
        return <Radio className="h-5 w-5 text-primary animate-pulse" />;
      case "pending":
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Milestones Panel - LEFT SIDE */}
      <div className="w-80 lg:w-96 flex-shrink-0 border-r border-border bg-card flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-foreground">Shipment Details</span>
        </div>

        {/* Milestones List */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radio className="h-4 w-4 text-green-600" />
              <span>Live</span>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-56px)]">
            <div className="p-4 space-y-1">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {/* Connecting line */}
                  {index < milestones.length - 1 && (
                    <div 
                      className={cn(
                        "absolute left-[10px] top-[28px] w-0.5 h-[calc(100%+4px)]",
                        milestone.status === "completed" ? "bg-green-600" : "bg-border"
                      )} 
                    />
                  )}
                  
                  <div 
                    className={cn(
                      "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                      milestone.status === "current" && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className="flex-shrink-0 relative z-10 bg-card">
                      {getStatusIcon(milestone.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {milestone.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {milestone.location}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Planned: </span>
                          <span className="text-foreground">{milestone.plannedDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual: </span>
                          <span className={cn(
                            milestone.actualDate ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {milestone.actualDate || "--"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content - Map and Details */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title and Route */}
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-semibold text-lg text-foreground">
                {shipment.containerId}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="text-lg">🇻🇳</span>
                  <span className="truncate max-w-[150px]">{shipment.origin.port}</span>
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="text-lg">🇧🇪</span>
                  <span className="truncate max-w-[150px]">{shipment.destination.port}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{shipment.carrier.code}</span>
              </div>
              <Badge variant={shipment.status === "in-transit" || shipment.status === "yet-to-start" ? "default" : 
                             shipment.status === "delayed" ? "destructive" : "secondary"}>
                {shipment.status.toUpperCase().replace("-", " ")}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Container / BL number:</span>
              <p className="font-medium text-foreground">{shipment.containerId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Containers:</span>
              <p className="font-medium text-foreground">1</p>
            </div>
            <div>
              <span className="text-muted-foreground">Consignee:</span>
              <p className="font-medium text-foreground truncate max-w-[150px]">{shipment.consignee}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Carrier ETA:</span>
              <p className="font-medium text-foreground">{shipment.carrierEta || "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Prediction:</span>
              <p className={cn(
                "font-medium",
                shipment.prediction && shipment.prediction.daysLate > 0 ? "text-destructive" : "text-green-600"
              )}>
                {shipment.prediction && shipment.prediction.daysLate > 0 
                  ? `${shipment.prediction.daysLate} Days Late`
                  : shipment.prediction?.daysLate === 0 
                    ? "On Time"
                    : `${Math.abs(shipment.prediction?.daysLate || 0)} Days Early`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-card h-auto p-0">
            <TabsTrigger 
              value="map" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Map View
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Table View
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="flex-1 m-0 relative">
            {/* Map Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              {/* Simplified Map Visualization */}
              <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                {/* Ocean background */}
                <rect width="800" height="400" fill="hsl(210, 50%, 95%)" className="dark:fill-[hsl(210,50%,15%)]" />
                
                {/* Simplified continents */}
                <ellipse cx="150" cy="200" rx="100" ry="80" fill="hsl(120, 20%, 90%)" className="dark:fill-[hsl(120,20%,30%)]" />
                <ellipse cx="400" cy="180" rx="150" ry="100" fill="hsl(120, 20%, 90%)" className="dark:fill-[hsl(120,20%,30%)]" />
                <ellipse cx="650" cy="220" rx="100" ry="70" fill="hsl(120, 20%, 90%)" className="dark:fill-[hsl(120,20%,30%)]" />
                
                {/* Route line */}
                <path 
                  d="M 650 220 Q 500 350 300 280 Q 200 250 150 200" 
                  stroke="hsl(210, 79%, 46%)" 
                  strokeWidth="3" 
                  strokeDasharray="10,5"
                  fill="none"
                  className="animate-pulse"
                />
                
                {/* Actual path traveled */}
                <path 
                  d="M 650 220 Q 550 300 450 280" 
                  stroke="hsl(210, 79%, 46%)" 
                  strokeWidth="3" 
                  fill="none"
                />
                
                {/* Origin marker */}
                <circle cx="650" cy="220" r="8" fill="hsl(120, 46%, 34%)" />
                <text x="660" y="210" fontSize="12" fill="hsl(120, 46%, 34%)" className="font-medium">Origin</text>
                
                {/* Current position (ship) */}
                <g transform="translate(450, 280)">
                  <circle r="12" fill="hsl(210, 79%, 46%)" />
                  <text x="15" y="5" fontSize="10" fill="hsl(210, 79%, 46%)">Current</text>
                </g>
                
                {/* Destination marker */}
                <circle cx="150" cy="200" r="8" fill="hsl(0, 65%, 51%)" />
                <text x="100" y="190" fontSize="12" fill="hsl(0, 65%, 51%)" className="font-medium">Dest.</text>
              </svg>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-primary" />
                    <span>Last 24 Hours Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 border-t-2 border-dashed border-muted-foreground" />
                    <span>Expected Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-primary" />
                    <span>Actual Path</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="flex-1 m-0 p-4">
            <div className="bg-card rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Event</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Planned</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actual</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone) => (
                    <tr key={milestone.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{milestone.name}</td>
                      <td className="p-3 text-muted-foreground">{milestone.location}</td>
                      <td className="p-3">{milestone.plannedDate}</td>
                      <td className="p-3">{milestone.actualDate || "--"}</td>
                      <td className="p-3">
                        <Badge variant={
                          milestone.status === "completed" ? "default" :
                          milestone.status === "current" ? "secondary" : "outline"
                        }>
                          {milestone.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="flex-1 m-0 p-4">
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No documents uploaded yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
