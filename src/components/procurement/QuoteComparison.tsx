import { useQuotesByLane, useCreateAward } from '@/hooks/useProcurement';
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
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Star, 
  Loader2,
  CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqLane, Quote, Carrier } from '@/types/procurement';

interface QuoteComparisonProps {
  lane: RfqLane;
  rfqId: string;
}

export function QuoteComparison({ lane, rfqId }: QuoteComparisonProps) {
  const { data: quotes, isLoading } = useQuotesByLane(lane.id);
  const createAward = useCreateAward();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No quotes submitted for this lane yet.
      </div>
    );
  }

  // Calculate stats
  const avgRate = quotes.reduce((sum, q) => sum + (q.total_landed_cost || q.base_freight_rate), 0) / quotes.length;
  const minRate = Math.min(...quotes.map(q => q.total_landed_cost || q.base_freight_rate));
  const maxRate = Math.max(...quotes.map(q => q.total_landed_cost || q.base_freight_rate));

  const handleAward = async (quote: Quote) => {
    await createAward.mutateAsync({
      rfq_id: rfqId,
      lane_id: lane.id,
      quote_id: quote.id,
      carrier_id: quote.carrier_id,
      awarded_rate: quote.total_landed_cost || quote.base_freight_rate,
      currency: quote.currency,
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRateDelta = (rate: number) => {
    const delta = ((rate - avgRate) / avgRate) * 100;
    return delta;
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
          <p className="text-sm text-muted-foreground">Quotes Received</p>
          <p className="text-2xl font-bold text-accent">{quotes.length}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-success-light/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Best Rate</p>
          <p className="text-lg font-bold text-success">{formatCurrency(minRate)}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="text-lg font-bold">{formatCurrency(avgRate)}</p>
        </div>
        <div className="bg-destructive/10 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Highest</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(maxRate)}</p>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Carrier</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Surcharges</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Transit</TableHead>
              <TableHead>vs Avg</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote, index) => {
              const carrier = quote.carrier as Carrier;
              const totalCost = quote.total_landed_cost || quote.base_freight_rate;
              const delta = getRateDelta(totalCost);
              const isBest = totalCost === minRate;
              const surchargesTotal = (quote.surcharges as any[] || []).reduce((sum: number, s: any) => 
                sum + (s.type === 'fixed' ? s.amount : quote.base_freight_rate * (s.amount / 100)), 0
              );

              return (
                <TableRow 
                  key={quote.id}
                  className={cn(
                    "animate-fade-in",
                    isBest && "bg-success-light/30"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isBest && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Star className="h-4 w-4 text-warning fill-warning" />
                          </TooltipTrigger>
                          <TooltipContent>Best Rate</TooltipContent>
                        </Tooltip>
                      )}
                      <div>
                        <p className="font-medium">{carrier?.name || 'Unknown Carrier'}</p>
                        <p className="text-xs text-muted-foreground">{carrier?.code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(quote.base_freight_rate, quote.currency)}
                    {quote.rate_unit && (
                      <span className="text-xs text-muted-foreground">/{quote.rate_unit}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {surchargesTotal > 0 ? (
                      <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">
                          +{formatCurrency(surchargesTotal, quote.currency)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            {(quote.surcharges as any[] || []).map((s: any, i: number) => (
                              <div key={i} className="flex justify-between gap-4 text-xs">
                                <span>{s.name}</span>
                                <span>
                                  {s.type === 'fixed' 
                                    ? formatCurrency(s.amount, quote.currency)
                                    : `${s.amount}%`
                                  }
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
                  <TableCell className={cn("font-bold", isBest && "text-success")}>
                    {formatCurrency(totalCost, quote.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{quote.transit_time_days || '—'} days</span>
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
                    {quote.status === 'accepted' ? (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Awarded
                      </Badge>
                    ) : lane.is_awarded ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Lane Awarded
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleAward(quote)}
                        disabled={createAward.isPending}
                      >
                        {createAward.isPending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Award className="mr-1 h-3 w-3" />
                        )}
                        Award
                      </Button>
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
