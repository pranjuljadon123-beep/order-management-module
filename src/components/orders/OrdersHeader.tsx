import { Plus, Upload, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrdersHeaderProps {
  onCreateOrder: () => void;
}

export function OrdersHeader({ onCreateOrder }: OrdersHeaderProps) {
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
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
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
