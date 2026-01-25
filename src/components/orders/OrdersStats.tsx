import { 
  Package, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useOrderStats } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';

export function OrdersStats() {
  const { data: stats, isLoading } = useOrderStats();

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.total || 0,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-accent',
    },
    {
      label: 'Pending Confirmation',
      value: stats?.created || 0,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning-light',
    },
    {
      label: 'Ready to Ship',
      value: stats?.ready_to_ship || 0,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success-light',
    },
    {
      label: 'In Transit',
      value: stats?.in_transit || 0,
      icon: Truck,
      color: 'text-info',
      bgColor: 'bg-info-light',
    },
    {
      label: 'Delivered (MTD)',
      value: stats?.delivered || 0,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success-light',
    },
    {
      label: 'High Risk',
      value: stats?.high_risk || 0,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
