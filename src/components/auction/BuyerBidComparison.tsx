import { useLaneRankings, useLaneBids, useAwardLane } from '@/hooks/useAuction';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Star,
  Loader2,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqLane } from '@/types/procurement';
import type { Bid } from '@/types/auction';

interface BuyerBidComparisonProps {
  lane: RfqLane;
  rfqId: string;
  auctionStatus: string;
  roundNumber?: number;
}

export function BuyerBidComparison({ lane, rfqId, auctionStatus, roundNumber = 1 }: BuyerBidComparisonProps) {
  const { data: rankings, isLoading: rankingsLoading } = useLaneRankings(lane.id, roundNumber);
  const { data: bids, isLoading: bidsLoading } = useLaneBids(lane.id, roundNumber);
  const awardLane = useAwardLane();

  const isLoading = rankingsLoading || bidsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No bids received for this lane yet.
      </div>
    );
  }

  // Combine rankings with bids for display
  const rankedBids = rankings.map((ranking) => {
    const bid = bids?.find((b) => b.id === ranking.bid_id) || ranking.bid;
    return {
      ...ranking,
      bid: bid as Bid,
    };
  }).sort((a, b) => a.rank - b.rank);

  const bestRate = rankedBids[0]?.bid?.total_landed_cost || 0;
  const avgRate = rankedBids.length > 0
    ? rankedBids.reduce((sum, r) => sum + (r.bid?.total_landed_cost || 0), 0) / rankedBids.length
    : 0;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRateDelta = (rate: number) => {
    return ((rate - avgRate) / avgRate) * 100;
  };

  const handleAward = async (ranking: typeof rankedBids[0]) => {
    if (!ranking.bid) return;
    await awardLane.mutateAsync({
      rfqId,
      laneId: lane.id,
      bidId: ranking.bid.id,
      carrierId: ranking.carrier_id,
      awardedRate: ranking.bid.total_landed_cost,
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-warning fill-warning" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <Hash className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* Lane Header */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
        <div>
          <p className="text-sm text-muted-foreground">Lane {lane.lane_number}</p>
          <p className="font-semibold text-lg">
            {lane.origin_city}, {lane.origin_country} → {lane.destination_city}, {lane.destination_country}
          </p>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {lane.equipment_type && <span>{lane.equipment_type}</span>}
            {lane.estimated_volume && <span>{lane.estimated_volume} {lane.volume_unit}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Vendors Bidding</p>
          <p className="text-2xl font-bold text-accent">{rankedBids.length}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-success-light/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Best Rate (Rank #1)</p>
          <p className="text-lg font-bold text-success">{formatCurrency(bestRate)}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="text-lg font-bold">{formatCurrency(avgRate)}</p>
        </div>
        <div className="bg-info-light/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Bids</p>
          <p className="text-lg font-bold text-info">{bids?.length || 0}</p>
        </div>
      </div>

      {/* Bids Table - Full visibility for buyer */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[60px]">Rank</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Surcharges</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Transit</TableHead>
              <TableHead>vs Avg</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedBids.map((ranking, index) => {
              const bid = ranking.bid;
              if (!bid) return null;

              const carrier = (bid as any).carrier;
              const totalCost = bid.total_landed_cost;
              const delta = getRateDelta(totalCost);
              const isWinner = ranking.rank === 1;
              const surchargesTotal = (bid.surcharges || []).reduce((sum: number, s: any) =>
                sum + (s.type === 'fixed' ? s.amount : bid.base_rate * (s.amount / 100)), 0
              );

              return (
                <TableRow
                  key={ranking.id}
                  className={cn(
                    "animate-fade-in",
                    isWinner && "bg-success-light/30"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(ranking.rank)}
                      <span className={cn(
                        "font-bold",
                        isWinner && "text-warning"
                      )}>
                        #{ranking.rank}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{carrier?.name || 'Vendor'}</p>
                      <p className="text-xs text-muted-foreground">{carrier?.code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(bid.base_rate, bid.currency)}
                    {bid.rate_unit && (
                      <span className="text-xs text-muted-foreground">/{bid.rate_unit}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {surchargesTotal > 0 ? (
                      <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">
                          +{formatCurrency(surchargesTotal, bid.currency)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            {(bid.surcharges || []).map((s: any, i: number) => (
                              <div key={i} className="flex justify-between gap-4 text-xs">
                                <span>{s.name}</span>
                                <span>
                                  {s.type === 'fixed'
                                    ? formatCurrency(s.amount, bid.currency)
                                    : `${s.amount}%`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className={cn("font-bold", isWinner && "text-success")}>
                    {formatCurrency(totalCost, bid.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{bid.transit_time_days || '—'} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-normal",
                        delta < -5 && "border-success text-success",
                        delta > 5 && "border-destructive text-destructive"
                      )}
                    >
                      {delta < -1 && <TrendingDown className="mr-1 h-3 w-3" />}
                      {delta > 1 && <TrendingUp className="mr-1 h-3 w-3" />}
                      {Math.abs(delta) <= 1 && <Minus className="mr-1 h-3 w-3" />}
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {bid.status === 'accepted' ? (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Awarded
                      </Badge>
                    ) : lane.is_awarded ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Lane Awarded
                      </Badge>
                    ) : auctionStatus === 'closed' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "border-accent text-accent hover:bg-accent hover:text-accent-foreground",
                          isWinner && "bg-accent/10"
                        )}
                        onClick={() => handleAward(ranking)}
                        disabled={awardLane.isPending}
                      >
                        {awardLane.isPending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Trophy className="mr-1 h-3 w-3" />
                        )}
                        Award
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-info">
                        Auction Live
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
