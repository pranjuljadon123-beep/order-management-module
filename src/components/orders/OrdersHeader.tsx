import { Plus, Upload, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrdersHeaderProps {
  onCreateOrder: () => void;
}

export function OrdersHeader({ onCreateOrder }: OrdersHeaderProps) {
  const handleImportCSV = () => {
    toast.info("CSV Import", { description: "Opening file selector for bulk order import..." });
  };

  const handleExport = () => {
    toast.success("Export initiated", { description: "Preparing orders for download..." });
  };

  const handleSyncERP = () => {
    toast.success("ERP Sync started", { description: "Synchronizing with external ERP system..." });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Order Management
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create, manage, and track orders across your supply chain
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleImportCSV}>
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleSyncERP}>
          <RefreshCw className="h-4 w-4" />
          Sync ERP
        </Button>
        <Button onClick={onCreateOrder} className="gap-2">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>
    </div>
  );
}
