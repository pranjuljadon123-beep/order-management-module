import { AppLayout } from "@/components/layout/AppLayout";
import { ShipmentMap } from "@/components/dashboard/ShipmentMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Tracking = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Live Tracking
            </h1>
            <p className="mt-1 text-muted-foreground">
              Real-time visibility across all transport modes
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter tracking number..."
                className="w-80 pl-10"
              />
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Track
            </Button>
          </div>
        </div>
      </div>

      <ShipmentMap />
    </AppLayout>
  );
};

export default Tracking;
