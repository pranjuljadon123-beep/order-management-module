import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Edit, 
  Truck, 
  FileText, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Package,
  Ship,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useOrder, useOrderStateTransitions, useOrderShipments, useOrderDocuments, useUpdateOrderStatus } from '@/hooks/useOrders';
import { ORDER_STATUS_CONFIG, ORDER_TYPE_CONFIG, RISK_LEVEL_CONFIG, type OrderStatus } from '@/types/orders';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrderDetailViewProps {
  orderId: string;
  onBack: () => void;
}

export function OrderDetailView({ orderId, onBack }: OrderDetailViewProps) {
  const { data: order, isLoading } = useOrder(orderId);
  const { data: transitions } = useOrderStateTransitions(orderId);
  const { data: shipments } = useOrderShipments(orderId);
  const { data: documents } = useOrderDocuments(orderId);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast({ title: 'Status updated', description: `Order status changed to ${ORDER_STATUS_CONFIG[newStatus].label}` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const typeConfig = ORDER_TYPE_CONFIG[order.order_type];
  const riskConfig = order.risk_level ? RISK_LEVEL_CONFIG[order.risk_level] : RISK_LEVEL_CONFIG.low;

  const getModeIcon = () => {
    switch (order.mode) {
      case 'ocean': return Ship;
      case 'air': return Plane;
      default: return Truck;
    }
  };
  const ModeIcon = getModeIcon();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{order.order_number}</h1>
              <Badge className={cn(statusConfig.bgColor, statusConfig.color, 'border-0')}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline">{typeConfig.label}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created {format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
              <span>•</span>
              <span>Version {order.version}</span>
              {order.customer?.name && (
                <>
                  <span>•</span>
                  <span>{order.customer.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Order
          </Button>
          <Button className="gap-2">
            <Truck className="h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      {/* Route & Risk Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Route Card */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <ModeIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span>{order.origin_city || 'Origin'}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span>{order.destination_city || 'Destination'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.mode ? order.mode.charAt(0).toUpperCase() + order.mode.slice(1) : 'Mode TBD'} • {order.incoterms || 'Incoterms TBD'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Timeline Card */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info-light">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">
                  {order.requested_delivery_date
                    ? format(new Date(order.requested_delivery_date), 'MMM dd, yyyy')
                    : 'TBD'}
                </p>
                <p className="text-sm text-muted-foreground">Requested Delivery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Score Card */}
        <Card className={cn("border-border/50", order.risk_level === 'high' || order.risk_level === 'critical' ? 'border-destructive/50' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", riskConfig.bgColor)}>
                <AlertTriangle className={cn("h-6 w-6", riskConfig.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn("text-lg font-semibold", riskConfig.color)}>
                    {order.risk_score || 0}% Risk
                  </p>
                  <Badge className={cn(riskConfig.bgColor, riskConfig.color, 'border-0')}>
                    {riskConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">AI-calculated risk score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shipments">
            Shipments {shipments?.length ? `(${shipments.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents {documents?.length ? `(${documents.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Sparkles className="mr-1 h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Details */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commodity</p>
                  <p className="text-foreground">{order.commodity_description || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU / HS Code</p>
                  <p className="text-foreground">{order.sku_code || order.hs_code || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p className="text-foreground">{order.quantity ? `${order.quantity} ${order.quantity_unit}` : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weight</p>
                  <p className="text-foreground">{order.weight_value ? `${order.weight_value} ${order.weight_unit}` : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Volume</p>
                  <p className="text-foreground">{order.volume_value ? `${order.volume_value} ${order.volume_unit}` : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Level</p>
                  <p className="text-foreground">{order.service_level || 'Standard'}</p>
                </div>
                <Separator className="sm:col-span-2" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipper</p>
                  <p className="text-foreground">{order.shipper?.name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consignee</p>
                  <p className="text-foreground">{order.consignee?.name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Origin Address</p>
                  <p className="text-foreground">{order.origin_address || `${order.origin_city || ''}, ${order.origin_country || ''}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destination Address</p>
                  <p className="text-foreground">{order.destination_address || `${order.destination_city || ''}, ${order.destination_country || ''}`}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Workflow */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Order Lifecycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['created', 'confirmed', 'ready_to_ship', 'booked', 'in_transit', 'delivered', 'closed'] as OrderStatus[]).map((status, index) => {
                    const config = ORDER_STATUS_CONFIG[status];
                    const isCurrent = order.status === status;
                    const isPast = getStatusOrder(order.status) > getStatusOrder(status);
                    
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2",
                          isCurrent && "border-primary bg-primary text-primary-foreground",
                          isPast && "border-success bg-success text-success-foreground",
                          !isCurrent && !isPast && "border-muted bg-muted text-muted-foreground"
                        )}>
                          {isPast ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm font-medium",
                            isCurrent && "text-foreground",
                            isPast && "text-muted-foreground",
                            !isCurrent && !isPast && "text-muted-foreground"
                          )}>
                            {config.label}
                          </p>
                        </div>
                        {isCurrent && index < 6 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleStatusChange(getNextStatus(status))}
                            disabled={updateStatus.isPending}
                          >
                            Advance
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipments">
          <Card className="border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              {shipments?.length ? (
                <div className="space-y-4">
                  {shipments.map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{shipment.shipment_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.allocated_quantity} units allocated
                        </p>
                      </div>
                      <Badge>{shipment.shipment_status || 'Pending'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 font-medium">No shipments linked yet</p>
                  <p className="text-sm">Create a shipment from this order to start tracking</p>
                  <Button className="mt-4">Create Shipment</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              {documents?.length ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                        </div>
                      </div>
                      <Badge variant={doc.status === 'approved' ? 'default' : 'outline'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 font-medium">No documents attached</p>
                  <p className="text-sm">Upload documents or generate them automatically</p>
                  <Button className="mt-4">Upload Document</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {transitions?.length ? (
                <div className="space-y-4">
                  {transitions.map((transition) => (
                    <div key={transition.id} className="flex items-start gap-4 border-l-2 border-border pl-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Status changed to {ORDER_STATUS_CONFIG[transition.to_status].label}
                        </p>
                        {transition.from_status && (
                          <p className="text-sm text-muted-foreground">
                            From {ORDER_STATUS_CONFIG[transition.from_status].label}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transition.created_at), 'MMM dd, yyyy HH:mm')}
                          {transition.triggered_by_system && ` • by ${transition.triggered_by_system}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* AI Recommendations */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(order.ai_recommendations) && order.ai_recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {order.ai_recommendations.map((rec, i) => (
                      <div key={i} className="rounded-lg border border-primary/20 bg-accent/30 p-4">
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        {rec.action && (
                          <Button size="sm" className="mt-2">{rec.action}</Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4">No AI recommendations yet</p>
                    <p className="text-sm">Insights will appear as order progresses</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(order.risk_factors) && order.risk_factors.length > 0 ? (
                  <div className="space-y-4">
                    {order.risk_factors.map((factor, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{factor.type}</p>
                          <Badge variant={factor.impact === 'high' ? 'destructive' : 'outline'}>
                            {factor.impact} impact
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-success/50" />
                    <p className="mt-4">No risk factors detected</p>
                    <p className="text-sm">Order appears to be low risk</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusOrder(status: OrderStatus): number {
  const order: Record<OrderStatus, number> = {
    created: 0,
    confirmed: 1,
    ready_to_ship: 2,
    booked: 3,
    in_transit: 4,
    delivered: 5,
    closed: 6,
    cancelled: -1,
  };
  return order[status];
}

function getNextStatus(current: OrderStatus): OrderStatus {
  const flow: OrderStatus[] = ['created', 'confirmed', 'ready_to_ship', 'booked', 'in_transit', 'delivered', 'closed'];
  const currentIndex = flow.indexOf(current);
  return flow[currentIndex + 1] || 'closed';
}
