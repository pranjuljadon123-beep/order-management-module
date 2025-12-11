import { AppLayout } from "@/components/layout/AppLayout";
import { ShipmentTable } from "@/components/dashboard/ShipmentTable";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";

const Shipments = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Shipments
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage and track all your shipments in one place
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4" />
              New Shipment
            </Button>
          </div>
        </div>
      </div>

      <ShipmentTable />
    </AppLayout>
  );
};

export default Shipments;
