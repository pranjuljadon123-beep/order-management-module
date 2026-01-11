import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSubmitBid, useVendorRanking, useVendorBids } from '@/hooks/useAuction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuctionTimer } from './AuctionTimer';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqLane } from '@/types/procurement';
import type { AuctionConfig, SubmitBidInput } from '@/types/auction';

interface VendorBidPanelProps {
  rfqId: string;
  rfqTitle: string;
  lane: RfqLane;
  carrierId: string;
  auctionConfig: AuctionConfig;
  auctionStatus: string;
}

export function VendorBidPanel({
  rfqId,
  rfqTitle,
  lane,
  carrierId,
  auctionConfig,
  auctionStatus,
}: VendorBidPanelProps) {
  const [showForm, setShowForm] = useState(false);

  const { data: ranking, isLoading: rankingLoading, refetch: refetchRanking } = useVendorRanking(
    lane.id,
    carrierId,
    auctionConfig.current_round
  );
  const { data: myBids, isLoading: bidsLoading, refetch: refetchBids } = useVendorBids(rfqId, carrierId);

  const submitBid = useSubmitBid();

  const myLaneBids = myBids?.filter((b) => b.lane_id === lane.id) || [];
  const latestBid = myLaneBids[0];
  const bestRankAchieved = Math.min(...myLaneBids.map((b) => ranking?.rank || 999), ranking?.rank || 999);

  const form = useForm<SubmitBidInput>({
    defaultValues: {
      rfq_id: rfqId,
      lane_id: lane.id,
      carrier_id: carrierId,
      base_rate: latestBid?.base_rate || 0,
      currency: 'USD',
      rate_unit: 'per container',
      transit_time_days: latestBid?.transit_time_days || undefined,
    },
  });

  const onSubmit = async (data: SubmitBidInput) => {
    await submitBid.mutateAsync({
      ...data,
      rfq_id: rfqId,
      lane_id: lane.id,
      carrier_id: carrierId,
    });
    setShowForm(false);
    refetchRanking();
    refetchBids();
  };

  const canBid = auctionStatus === 'live';
  const isWinning = ranking?.rank === 1;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isWinning && "ring-2 ring-success shadow-lg",
      !canBid && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lane {lane.lane_number}</p>
            <CardTitle className="text-base">
              {lane.origin_city} → {lane.destination_city}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {lane.origin_country} to {lane.destination_country}
            </p>
          </div>
          {auctionConfig.auction_end && canBid && (
            <AuctionTimer endTime={auctionConfig.auction_end} size="sm" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rank Display - ONLY shows vendor's own rank, not prices */}
        <div className={cn(
          "rounded-lg p-4 text-center",
          isWinning ? "bg-success-light" : "bg-muted/50"
        )}>
          {rankingLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          ) : ranking ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                {isWinning ? (
                  <Trophy className="h-5 w-5 text-success" />
                ) : (
                  <Hash className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(
                  "text-3xl font-bold",
                  isWinning ? "text-success" : "text-foreground"
                )}>
                  #{ranking.rank}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                of {ranking.total_vendors} vendor{ranking.total_vendors !== 1 ? 's' : ''}
              </p>
              {isWinning && (
                <Badge className="mt-2 bg-success text-success-foreground">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Leading
                </Badge>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">
              <Target className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm">No bid submitted yet</p>
            </div>
          )}
        </div>

        {/* Latest Bid Info */}
        {latestBid && (
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your Latest Bid</span>
              <span className="font-semibold">{formatCurrency(latestBid.total_landed_cost)}</span>
            </div>
            {latestBid.transit_time_days && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Transit Time</span>
                <span>{latestBid.transit_time_days} days</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-1">
              <span className="text-muted-foreground">Revisions</span>
              <span>{myLaneBids.length}</span>
            </div>
          </div>
        )}

        {/* Bid Form */}
        {showForm && canBid ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="base_rate"
                  rules={{ required: 'Rate required', min: { value: 0.01, message: 'Must be positive' } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Base Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transit_time_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Transit (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rate_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Rate Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="per container">Per Container</SelectItem>
                        <SelectItem value="per TEU">Per TEU</SelectItem>
                        <SelectItem value="per CBM">Per CBM</SelectItem>
                        <SelectItem value="per kg">Per kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent/90"
                  disabled={submitBid.isPending}
                >
                  {submitBid.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : latestBid ? (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  )}
                  {latestBid ? 'Improve Bid' : 'Submit Bid'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Button
            className={cn(
              "w-full",
              canBid ? "bg-accent hover:bg-accent/90" : "bg-muted text-muted-foreground"
            )}
            disabled={!canBid}
            onClick={() => setShowForm(true)}
          >
            {!canBid ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Auction {auctionStatus === 'closed' ? 'Closed' : 'Not Active'}
              </>
            ) : latestBid ? (
              <>
                <TrendingDown className="mr-2 h-4 w-4" />
                Improve Your Bid
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Place Bid
              </>
            )}
          </Button>
        )}

        {/* Important: No competitor price information shown */}
        {canBid && !isWinning && ranking && (
          <p className="text-xs text-center text-muted-foreground">
            Lower your bid to improve your rank
          </p>
        )}
      </CardContent>
    </Card>
  );
}
