import { useAuctionStats } from '@/hooks/useAuction';
import { Gavel, Calendar, Trophy, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuctionStats() {
  const { data: stats, isLoading } = useAuctionStats();

  const statCards = [
    {
      label: 'Live Auctions',
      value: stats?.liveAuctions ?? 0,
      icon: Activity,
      bgColor: 'bg-success-light',
      iconColor: 'text-success',
      pulse: (stats?.liveAuctions ?? 0) > 0,
    },
    {
      label: 'Scheduled',
      value: stats?.scheduledAuctions ?? 0,
      icon: Calendar,
      bgColor: 'bg-info-light',
      iconColor: 'text-info',
    },
    {
      label: 'Pending Awards',
      value: stats?.pendingAwards ?? 0,
      icon: Trophy,
      bgColor: 'bg-warning-light',
      iconColor: 'text-warning',
    },
    {
      label: 'Bids Today',
      value: stats?.totalBidsToday ?? 0,
      icon: Gavel,
      bgColor: 'bg-cyan-light',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "kpi-card bg-card animate-fade-in relative",
            isLoading && "animate-pulse"
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {stat.pulse && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
          )}
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
