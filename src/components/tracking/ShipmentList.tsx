import { ShipmentCard } from "./ShipmentCard";
import type { ViewMode } from "./TrackingSidebar";
import type { Shipment } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

interface ShipmentListProps {
  shipments: Shipment[];
  viewMode: ViewMode;
  onSelectShipment: (shipment: Shipment) => void;
  onMarkAlertRead: (shipmentId: string) => void;
}

export function ShipmentList({
  shipments,
  viewMode,
  onSelectShipment,
  onMarkAlertRead,
}: ShipmentListProps) {
  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No shipments found</p>
        <p className="text-sm">Try adjusting your filters or add a new shipment</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-4",
      viewMode === "grid" && "grid grid-cols-1 lg:grid-cols-2 gap-4"
    )}>
      {shipments.map((shipment) => (
        <ShipmentCard
          key={shipment.id}
          containerId={shipment.containerId}
          rfNumber={shipment.rfNumber}
          isNew={shipment.isNew}
          carrier={shipment.carrier}
          origin={shipment.origin}
          destination={shipment.destination}
          consignee={shipment.consignee}
          carrierEta={shipment.carrierEta}
          prediction={shipment.prediction}
          status={shipment.status}
          progress={shipment.progress}
          alert={shipment.alert}
          onSelect={() => onSelectShipment(shipment)}
          onMarkAlertRead={() => onMarkAlertRead(shipment.id)}
        />
      ))}
    </div>
  );
}
