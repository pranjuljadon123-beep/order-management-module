import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrdersStats } from '@/components/orders/OrdersStats';
import { OrdersFilters } from '@/components/orders/OrdersFilters';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import type { OrderStatus, OrderType } from '@/types/orders';

export default function Orders() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: OrderStatus;
    order_type?: OrderType;
    mode?: string;
    search?: string;
  }>({});

  if (selectedOrderId) {
    return (
      <AppLayout>
        <OrderDetailView
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <OrdersHeader onCreateOrder={() => setIsCreateDialogOpen(true)} />
        <OrdersStats />
        <OrdersFilters filters={filters} onFiltersChange={setFilters} />
        <OrdersTable
          filters={filters}
          onSelectOrder={(orderId) => setSelectedOrderId(orderId)}
        />
      </div>

      <CreateOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </AppLayout>
  );
}
