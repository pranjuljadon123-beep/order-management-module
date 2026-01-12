import { AppLayout } from "@/components/layout/AppLayout";
import { TrackingSidebar } from "@/components/tracking/TrackingSidebar";
import { TrackingHeader } from "@/components/tracking/TrackingHeader";
import { IncidentAlert } from "@/components/tracking/IncidentAlert";
import { QuickAddShipment } from "@/components/tracking/QuickAddShipment";
import { ShipmentList } from "@/components/tracking/ShipmentList";

const Tracking = () => {
  return (
    <AppLayout>
      <div className="flex h-full -mx-6 -mt-6">
        {/* Sidebar */}
        <TrackingSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Header */}
          <div className="p-4 border-b border-border bg-background">
            <TrackingHeader />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-4 bg-muted/30">
            {/* Incident Alert */}
            <IncidentAlert />

            {/* Quick Add */}
            <QuickAddShipment />

            {/* Shipment List */}
            <ShipmentList />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Tracking;
