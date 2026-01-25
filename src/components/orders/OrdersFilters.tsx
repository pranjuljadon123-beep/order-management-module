import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus, OrderType } from '@/types/orders';

interface OrdersFiltersProps {
  filters: {
    status?: OrderStatus;
    order_type?: OrderType;
    mode?: string;
    search?: string;
  };
  onFiltersChange: (filters: OrdersFiltersProps['filters']) => void;
}

export function OrdersFilters({ filters, onFiltersChange }: OrdersFiltersProps) {
  const hasFilters = Object.values(filters).some(v => v);

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders by ID, PO, commodity..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.order_type || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              order_type: value === 'all' ? undefined : (value as OrderType),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Order Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="purchase_order">Purchase Order</SelectItem>
            <SelectItem value="sales_order">Sales Order</SelectItem>
            <SelectItem value="transport_order">Transport Order</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : (value as OrderStatus),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.mode || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              mode: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="ocean">Ocean</SelectItem>
            <SelectItem value="air">Air</SelectItem>
            <SelectItem value="road">Road</SelectItem>
            <SelectItem value="rail">Rail</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
