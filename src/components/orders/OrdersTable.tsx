import { format } from 'date-fns';
import { 
  ArrowRight, 
  AlertTriangle, 
  MoreHorizontal,
  Eye,
  Copy,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrders } from '@/hooks/useOrders';
import { 
  ORDER_STATUS_CONFIG, 
  ORDER_TYPE_CONFIG, 
  RISK_LEVEL_CONFIG,
  type Order,
  type OrderStatus,
  type OrderType
} from '@/types/orders';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OrdersTableProps {
  filters: {
    status?: OrderStatus;
    order_type?: OrderType;
    mode?: string;
    search?: string;
  };
  onSelectOrder: (orderId: string) => void;
}

export function OrdersTable({ filters, onSelectOrder }: OrdersTableProps) {
  const { data: orders, isLoading } = useOrders(filters);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!orders?.length) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm">Create your first order or adjust your filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Orders</CardTitle>
          <Badge variant="secondary">{orders.length} orders</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">Order ID</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="w-[100px]">Incoterm</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Risk</TableHead>
                <TableHead className="w-[120px]">Delivery Date</TableHead>
                <TableHead className="w-[100px]">Updated</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onSelect={() => onSelectOrder(order.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderRow({ order, onSelect }: { order: Order; onSelect: () => void }) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const typeConfig = ORDER_TYPE_CONFIG[order.order_type];
  const riskConfig = order.risk_level ? RISK_LEVEL_CONFIG[order.risk_level] : null;

  return (
    <TableRow 
      className="cursor-pointer hover:bg-accent/30"
      onClick={onSelect}
    >
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="text-foreground">{order.order_number}</span>
          {order.po_number && (
            <span className="text-xs text-muted-foreground">PO: {order.po_number}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {typeConfig.shortLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{order.origin_city || 'TBD'}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{order.destination_city || 'TBD'}</span>
        </div>
        {order.mode && (
          <span className="text-xs text-muted-foreground capitalize">{order.mode}</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {order.incoterms || '—'}
        </span>
      </TableCell>
      <TableCell>
        <Badge className={cn(statusConfig.bgColor, statusConfig.color, 'border-0')}>
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        {riskConfig && order.risk_level !== 'low' ? (
          <div className="flex items-center gap-1">
            <AlertTriangle className={cn("h-4 w-4", riskConfig.color)} />
            <span className={cn("text-sm font-medium", riskConfig.color)}>
              {order.risk_score || 0}%
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Low</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {order.requested_delivery_date
            ? format(new Date(order.requested_delivery_date), 'MMM dd, yyyy')
            : '—'}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {format(new Date(order.updated_at), 'MMM dd')}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Truck className="mr-2 h-4 w-4" />
              Create Shipment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
