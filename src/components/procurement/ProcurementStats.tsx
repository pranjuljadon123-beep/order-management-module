import { useProcurementStats } from '@/hooks/useProcurement';
import { FileText, TrendingDown, Users, Clock, Award, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProcurementStats() {
  const { data: stats, isLoading } = useProcurementStats();

  const statCards = [
    {
      label: 'Active RFQs',
      value: stats?.activeRfqs ?? 0,
      icon: FileText,
      bgColor: 'bg-cyan-light',
      iconColor: 'text-accent',
    },
    {
      label: 'Avg. Savings',
      value: `${stats?.avgSavingsPercent ?? 0}%`,
      icon: TrendingDown,
      bgColor: 'bg-success-light',
      iconColor: 'text-success',
    },
    {
      label: 'Active Carriers',
      value: stats?.activeCarriers ?? 0,
      icon: Users,
      bgColor: 'bg-info-light',
      iconColor: 'text-info',
    },
    {
      label: 'Pending Quotes',
      value: stats?.pendingQuotes ?? 0,
      icon: Clock,
      bgColor: 'bg-warning-light',
      iconColor: 'text-warning',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "kpi-card bg-card animate-fade-in",
            isLoading && "animate-pulse"
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", stat.bgColor)}>
              <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '—' : stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
