import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Star,
  RefreshCw,
  Flag,
  Share2,
  Ship,
  Globe,
  FileText,
  ArrowUpRight,
  MoreHorizontal,
  Bell,
  Download,
  Printer,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment } from "@/hooks/useTracking";
import { ShipmentMapView } from "./ShipmentMapView";
import { MilestoneTimeline, type Milestone } from "./MilestoneTimeline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShipmentDetailViewProps {
  shipment: Shipment;
  onBack: () => void;
}

// Generate realistic coordinates based on progress
function generateCurrentPosition(shipment: Shipment) {
  const originCoords = getPortCoords(shipment.origin.port);
  const destCoords = getPortCoords(shipment.destination.port);
  
  // Calculate progress percentage
  let progress = 0;
  if (shipment.progress.emptyPickup) progress += 0.05;
  if (shipment.progress.gateIn) progress += 0.1;
  if (shipment.progress.origin) progress += 0.15;
  if (shipment.progress.transhipment.total > 0) {
    progress += (shipment.progress.transhipment.current / shipment.progress.transhipment.total) * 0.4;
  } else if (shipment.progress.origin) {
    progress += 0.4;
  }
  if (shipment.progress.destination) progress += 0.25;
  if (shipment.progress.gateOut) progress += 0.05;
  
  // Interpolate position
  const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * progress;
  const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * progress;
  
  // Add slight offset for more realistic positioning
  return {
    lat: lat + (Math.random() - 0.5) * 2,
    lng: lng + (Math.random() - 0.5) * 2,
  };
}

function getPortCoords(portName: string): { lat: number; lng: number } {
  const portCoords: Record<string, { lat: number; lng: number }> = {
    "jakarta": { lat: -6.1, lng: 106.8 },
    "surabaya": { lat: -7.25, lng: 112.75 },
    "singapore": { lat: 1.29, lng: 103.85 },
    "rotterdam": { lat: 51.9, lng: 4.5 },
    "shanghai": { lat: 31.2, lng: 121.5 },
    "hamburg": { lat: 53.55, lng: 9.99 },
    "antwerp": { lat: 51.26, lng: 4.4 },
    "dubai": { lat: 25.27, lng: 55.29 },
    "mumbai": { lat: 19.08, lng: 72.88 },
    "nhava sheva": { lat: 18.95, lng: 72.95 },
    "jnpt": { lat: 18.95, lng: 72.95 },
    "new york": { lat: 40.68, lng: -74.04 },
    "los angeles": { lat: 33.74, lng: -118.27 },
    "chicago": { lat: 41.88, lng: -87.63 },
    "ennore": { lat: 13.22, lng: 80.32 },
    "busan": { lat: 35.1, lng: 129.03 },
    "mombasa": { lat: -4.04, lng: 39.67 },
    "kampala": { lat: 0.35, lng: 32.58 },
  };

  const lowerPortName = portName.toLowerCase();
  for (const [key, coords] of Object.entries(portCoords)) {
    if (lowerPortName.includes(key)) {
      return coords;
    }
  }
  return { lat: 0, lng: 0 };
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function ShipmentDetailView({ shipment, onBack }: ShipmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState("map");
  
  // Calculate current vessel position
  const currentPosition = useMemo(() => generateCurrentPosition(shipment), [shipment]);
  const vesselHeading = useMemo(() => Math.floor(Math.random() * 360), []);

  // Generate milestones based on shipment data
  const milestones: Milestone[] = useMemo(() => [
    {
      id: "1",
      name: "Pickup",
      location: `${shipment.origin.port.split(",")[0]}, ${shipment.origin.country}`,
      locationDetail: "Container Depot Terminal A",
      plannedDate: "08 Jan 2026",
      actualDate: shipment.progress.emptyPickup ? "09 Jan 2026" : undefined,
      status: shipment.progress.emptyPickup ? "completed" : "pending",
      icon: "pickup" as const,
      source: "Terminal" as const,
    },
    {
      id: "2",
      name: "Gate In",
      location: `${shipment.origin.port.split(",")[0]} Port`,
      locationDetail: "Gate 4, Terminal 2",
      plannedDate: "08 Jan 2026",
      actualDate: shipment.progress.gateIn ? "09 Jan 2026" : undefined,
      status: shipment.progress.gateIn ? "completed" : "pending",
      icon: "warehouse" as const,
      source: "Terminal" as const,
    },
    {
      id: "3",
      name: "Origin Departure",
      location: `${shipment.origin.port.split(",")[0]}, ${shipment.origin.country}`,
      locationDetail: `Vessel: ${shipment.carrier.name}`,
      plannedDate: "10 Jan 2026",
      actualDate: shipment.progress.origin ? "10 Jan 2026" : undefined,
      status: shipment.progress.origin 
        ? "completed" 
        : shipment.progress.gateIn 
          ? "current" 
          : "pending",
      icon: "ship" as const,
      source: "Carrier" as const,
    },
    ...(shipment.progress.transhipment.total > 0 ? [
      {
        id: "4",
        name: "Transhipment",
        location: "Singapore, SG",
        locationDetail: "PSA Singapore Terminal",
        plannedDate: "18 Jan 2026",
        actualDate: shipment.progress.transhipment.current >= 1 ? "18 Jan 2026" : undefined,
        status: shipment.progress.transhipment.current >= 1 
          ? "completed" 
          : shipment.progress.origin 
            ? "current" 
            : "pending" as const,
        icon: "ship" as const,
        source: "AIS" as const,
        notes: shipment.progress.transhipment.current >= 1 
          ? undefined 
          : "Vessel approaching port, ETA updated via AIS",
      } as Milestone,
    ] : []),
    {
      id: "5",
      name: "Arrival",
      location: `${shipment.destination.port.split(",")[0]}, ${shipment.destination.country}`,
      locationDetail: shipment.destination.port,
      plannedDate: shipment.carrierEta || "14 Jan 2026",
      actualDate: shipment.progress.destination ? shipment.carrierEta : undefined,
      status: shipment.progress.destination 
        ? "completed" 
        : (shipment.progress.transhipment.current >= shipment.progress.transhipment.total && shipment.progress.origin) 
          ? (shipment.status === "delayed" ? "delayed" : "current")
          : "pending",
      icon: "ship" as const,
      source: "AIS" as const,
      notes: shipment.status === "delayed" && !shipment.progress.destination
        ? `Delay: ${shipment.prediction?.daysLate || 0} days behind schedule`
        : undefined,
    },
    {
      id: "6",
      name: "Out For Delivery",
      location: `${shipment.destination.port.split(",")[0]}, ${shipment.destination.country}`,
      locationDetail: "Local delivery in progress",
      plannedDate: "14 Jan 2026",
      actualDate: shipment.progress.gateOut ? "14 Jan 2026" : undefined,
      status: shipment.progress.gateOut ? "completed" : "pending",
      icon: "truck" as const,
      source: "Carrier" as const,
    },
    {
      id: "7",
      name: "Delivered",
      location: `${shipment.destination.port.split(",")[0]}, ${shipment.destination.country}`,
      locationDetail: `Consignee: ${shipment.consignee}`,
      plannedDate: "14 Jan 2026",
      actualDate: shipment.progress.emptyReturn ? "14 Jan 2026" : undefined,
      status: shipment.progress.emptyReturn ? "completed" : "pending",
      icon: "delivery" as const,
      source: "Carrier" as const,
    },
  ], [shipment]);

  const getStatusBadge = () => {
    switch (shipment.status) {
      case "delayed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20">
            DELAYED
          </Badge>
        );
      case "in-transit":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
            IN TRANSIT
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20">
            DELIVERED
          </Badge>
        );
      case "yet-to-start":
        return (
          <Badge variant="secondary">
            YET TO START
          </Badge>
        );
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-semibold text-foreground">
                  {shipment.containerId}
                </h1>
                
                {/* Route */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="text-base">{getFlagEmoji(shipment.origin.countryCode)}</span>
                    <span className="max-w-[120px] truncate hidden sm:inline">{shipment.origin.port.split(",")[0]}</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="flex items-center gap-1">
                    <span className="text-base">{getFlagEmoji(shipment.destination.countryCode)}</span>
                    <span className="max-w-[120px] truncate hidden sm:inline">{shipment.destination.port.split(",")[0]}</span>
                  </span>
                </div>

                {/* Carrier */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                  <Ship className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{shipment.carrier.code}</span>
                </div>

                {getStatusBadge()}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Flag className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Share2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Set Alert
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Carrier Site
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Tracking number:</span>
              <p className="font-medium text-foreground">{shipment.containerId}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Pieces:</span>
              <p className="font-medium text-foreground flex items-center gap-1">
                1 
                <Badge variant="outline" className="h-5 text-[10px] ml-1">40ft</Badge>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Consignee:</span>
              <p className="font-medium text-foreground">{shipment.consignee}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Est Delivery:</span>
              <p className="font-medium text-foreground">{shipment.carrierEta || "TBD"}</p>
            </div>
            {shipment.prediction && shipment.prediction.daysLate > 0 && (
              <div>
                <span className="text-muted-foreground text-xs">Delay:</span>
                <p className="font-medium text-destructive flex items-center gap-1">
                  {shipment.prediction.daysLate} Day{shipment.prediction.daysLate > 1 ? 's' : ''}
                  <ArrowUpRight className="h-3 w-3" />
                </p>
              </div>
            )}
            {shipment.prediction && shipment.prediction.daysLate <= 0 && (
              <div>
                <span className="text-muted-foreground text-xs">Status:</span>
                <p className="font-medium text-green-600">On Time</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs + Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-border bg-card px-4 flex items-center justify-between">
            <TabsList className="h-12 bg-transparent p-0 gap-0">
              <TabsTrigger 
                value="map" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-12"
              >
                Map View
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-12"
              >
                Table View
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-12"
              >
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Tab Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                AIS Data
              </Button>
            </div>
          </div>

          <TabsContent value="map" className="flex-1 m-0 min-h-0 flex">
            {/* Map Area */}
            <div className="flex-1 relative">
              <ShipmentMapView 
                shipment={shipment}
                currentPosition={currentPosition}
                vesselHeading={vesselHeading}
              />
            </div>

            {/* Milestone Timeline Sidebar */}
            <div className="w-80 lg:w-96 border-l border-border bg-card flex-shrink-0 flex flex-col">
              <MilestoneTimeline shipment={shipment} milestones={milestones} />
            </div>
          </TabsContent>

          <TabsContent value="table" className="flex-1 m-0 p-4 overflow-auto">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Event</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Planned</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Actual</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Source</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((milestone) => (
                      <tr key={milestone.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-foreground">{milestone.name}</div>
                          {milestone.locationDetail && (
                            <div className="text-xs text-muted-foreground mt-0.5">{milestone.locationDetail}</div>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">{milestone.location}</td>
                        <td className="p-3 text-foreground">{milestone.plannedDate}</td>
                        <td className="p-3">
                          <span className={cn(
                            milestone.actualDate ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {milestone.actualDate || "--"}
                          </span>
                        </td>
                        <td className="p-3">
                          {milestone.source && (
                            <Badge variant="secondary" className="text-xs">
                              {milestone.source}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={
                            milestone.status === "completed" ? "default" :
                            milestone.status === "current" ? "secondary" :
                            milestone.status === "delayed" ? "destructive" : "outline"
                          } className={cn(
                            milestone.status === "completed" && "bg-green-500/10 text-green-600 border-green-500/30",
                          )}>
                            {milestone.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="flex-1 m-0 p-4">
            <Card className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No Documents Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Documents like Bill of Lading, Commercial Invoice, and Packing List will appear here once uploaded.
              </p>
              <Button variant="outline" className="mt-4 gap-2">
                <Download className="h-4 w-4" />
                Upload Documents
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
