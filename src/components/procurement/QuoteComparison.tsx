import { useQuotesByLane, useCreateAward } from '@/hooks/useProcurement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Star, 
  Loader2,
  CheckCircle2,
  MoreVertical,
  MessageSquare,
  ChevronDown,
  Info,
  Filter,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqLane, Quote, Carrier, Surcharge } from '@/types/procurement';

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

  // Sort quotes by total cost and assign ranks
  const sortedQuotes = [...quotes].sort((a, b) => 
    (a.total_landed_cost || a.base_freight_rate) - (b.total_landed_cost || b.base_freight_rate)
  );

  // Calculate stats
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + currency;
  };

  const formatRate = (amount: number, quantity: number = 2, unit: string = "CONTAINER 20'", currency: string = 'USD') => {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ${currency} x ${quantity} ${unit}`;
  };

  // Generate a mock carrier reliability percentage for display purposes
  const getCarrierReliability = (carrierId: string) => {
    const hash = carrierId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return 30 + (Math.abs(hash) % 40); // Returns 30-70%
  };

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= rating 
              ? "fill-warning text-warning" 
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );

  // Calculate surcharges breakdown
  const getSurchargesBreakdown = (quote: Quote) => {
    const surcharges = (quote.surcharges as Surcharge[]) || [];
    let freightCharges = quote.base_freight_rate;
    let originCharges = 0;
    
    // Parse surcharges into categories
    const freightItems = surcharges.filter(s => 
      s.name.toLowerCase().includes('freight') || 
      s.name.toLowerCase().includes('ocean') ||
      s.name.toLowerCase().includes('baf')
    );
    
    const originItems = surcharges.filter(s => 
      s.name.toLowerCase().includes('origin') ||
      s.name.toLowerCase().includes('thc') ||
      s.name.toLowerCase().includes('bl') ||
      s.name.toLowerCase().includes('muc') ||
      s.name.toLowerCase().includes('local')
    );

    freightItems.forEach(s => {
      freightCharges += s.type === 'fixed' ? s.amount : (quote.base_freight_rate * s.amount / 100);
    });

    originItems.forEach(s => {
      originCharges += s.type === 'fixed' ? s.amount : (quote.base_freight_rate * s.amount / 100);
    });

    return {
      freightCharges,
      originCharges,
      surcharges
    };
  };

  return (
    <div className="space-y-4">
      {/* Horizontal scrollable vendor comparison */}
      <ScrollArea className="w-full">
        <div className="flex min-w-max">
          {/* Left sidebar with row labels */}
          <div className="w-48 flex-shrink-0 border-r border-border bg-muted/30">
            {/* Header spacer */}
            <div className="h-[180px] p-4 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Vendor</span>
              </div>
              <span className="text-sm text-muted-foreground">Price</span>
              <Button variant="outline" size="sm" className="mt-2 w-fit">
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </Button>
            </div>
            
            <Separator />
            
            {/* Row labels */}
            <div className="divide-y divide-border">
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">POL</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">POD</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Allocated Quantity</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Carrier</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Transit Time</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Detention Free Time</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Free Days At Destination</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Schedule</div>
              <div className="px-4 py-3 text-sm font-medium text-muted-foreground">Valid Till</div>
            </div>

            {/* Action buttons spacer */}
            <div className="px-4 py-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    Least Confirmed <Info className="inline h-3 w-3" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last Confirmed <Info className="inline h-3 w-3" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <span>{formatCurrency(minRate)}</span>
                  <span>{formatCurrency(maxRate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Rate
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Rate
                  </Button>
                </div>
              </div>
            </div>

            {/* Freight Charges Section */}
            <div className="border-t border-border">
              <div className="px-4 py-3 font-semibold text-sm bg-muted/50">Freight Charges</div>
              <div className="divide-y divide-border">
                <div className="px-4 py-2 text-sm text-muted-foreground">Ocean Freight 20ft</div>
                <div className="px-4 py-2 text-sm font-medium">Sub Total</div>
              </div>
            </div>

            {/* Origin Charges Section */}
            <div className="border-t border-border">
              <div className="px-4 py-3 font-semibold text-sm bg-muted/50">Origin Charges</div>
              <div className="divide-y divide-border">
                <div className="px-4 py-2 text-sm text-muted-foreground">Origin BL charges</div>
                <div className="px-4 py-2 text-sm text-muted-foreground">Origin MUC</div>
                <div className="px-4 py-2 text-sm text-muted-foreground">Origin Local Charges</div>
                <div className="px-4 py-2 text-sm text-muted-foreground">Origin THC 20ft</div>
                <div className="px-4 py-2 text-sm text-muted-foreground">BAF</div>
                <div className="px-4 py-2 text-sm font-medium">Sub Total</div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border divide-y divide-border">
              <div className="px-4 py-3 font-semibold text-sm">Total Charges</div>
              <div className="px-4 py-2 text-sm font-semibold">Total Price</div>
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">Total Price Per Unit</div>
            </div>
          </div>

          {/* Vendor columns */}
          {sortedQuotes.map((quote, index) => {
            const carrier = quote.carrier as Carrier;
            const totalCost = quote.total_landed_cost || quote.base_freight_rate;
            const rank = index + 1;
            const isConfirmed = quote.status === 'accepted';
            const reliability = getCarrierReliability(quote.carrier_id);
            const { freightCharges, originCharges, surcharges } = getSurchargesBreakdown(quote);

            return (
              <div 
                key={quote.id} 
                className={cn(
                  "w-56 flex-shrink-0 border-r border-border",
                  rank === 1 && "bg-success-light/20"
                )}
              >
                {/* Vendor Header */}
                <div className="h-[180px] p-4 text-center relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Download Quote</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <h3 className="font-semibold text-sm mb-1">{carrier?.name || 'Unknown Carrier'}</h3>
                  <StarRating rating={carrier?.rating || 3} />
                  <p className="text-lg font-bold mt-2">{formatCurrency(totalCost)}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        rank === 1 && "border-accent text-accent"
                      )}
                    >
                      RANK #{rank}
                    </Badge>
                    {isConfirmed && (
                      <Badge className="bg-success text-success-foreground text-xs">
                        CONFIRMED
                      </Badge>
                    )}
                  </div>

                  {isConfirmed && (
                    <p className="text-xs text-success mt-1">Confirmed By: Admin</p>
                  )}
                </div>

                <Separator />

                {/* Row values */}
                <div className="divide-y divide-border">
                  <div className="px-3 py-3 text-sm text-center">
                    {lane.origin_city}, {lane.origin_country}
                    {lane.origin_port_code && <>, {lane.origin_port_code}</>}
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    {lane.destination_city}, {lane.destination_country}
                    {lane.destination_port_code && <>, {lane.destination_port_code}</>}
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    {lane.estimated_volume || '-'}
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    <span className="font-medium">{carrier?.code || '-'}</span>
                    {' | '}
                    <span className={cn(
                      "font-semibold",
                      reliability >= 50 ? "text-success" : "text-warning"
                    )}>
                      {reliability}%
                    </span>
                    <Info className="inline h-3 w-3 ml-1 text-muted-foreground" />
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    {quote.transit_time_days || 0} days
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    {Math.max(7, (quote.transit_time_days || 14) - 7)} days
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    {Math.max(4, Math.floor((quote.transit_time_days || 14) / 4))} days
                  </div>
                  <div className="px-3 py-3 text-xs text-center text-muted-foreground">
                    Sun, Mon, Tue, Wed, Thu, Fri, Sat
                  </div>
                  <div className="px-3 py-3 text-sm text-center">
                    {quote.validity_end 
                      ? new Date(quote.validity_end).toLocaleDateString('en-GB')
                      : '30/06/2024'
                    }
                  </div>
                </div>

                {/* Action buttons */}
                <div className="px-3 py-4 border-t border-border space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View Complete Quote
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-1">
                    {isConfirmed ? (
                      <>
                        <Button size="sm" variant="outline" className="text-xs border-warning text-warning hover:bg-warning/10">
                          Reconfirm Quote
                        </Button>
                        <Button size="sm" className="text-xs bg-success hover:bg-success/90 text-success-foreground">
                          Create Dispatch
                        </Button>
                      </>
                    ) : lane.is_awarded ? (
                      <Button size="sm" variant="outline" className="col-span-2 text-xs text-muted-foreground" disabled>
                        Lane Awarded
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          className="text-xs bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => handleAward(quote)}
                          disabled={createAward.isPending}
                        >
                          {createAward.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Confirm Quote'
                          )}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs border-accent text-accent hover:bg-accent/10">
                          Negotiate
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <Button variant="outline" size="sm" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Messages
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          More Options
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Request Revision</DropdownMenuItem>
                        <DropdownMenuItem>Compare Rates</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Freight Charges Section */}
                <div className="border-t border-border">
                  <div className="px-3 py-3 bg-muted/50 text-center">
                    {/* Header placeholder */}
                  </div>
                  <div className="divide-y divide-border">
                    <div className="px-3 py-2 text-xs text-center">
                      {formatRate(quote.base_freight_rate, 2, "CONTAINER 20'")}
                    </div>
                    <div className="px-3 py-2 text-sm font-semibold text-center">
                      {formatCurrency(freightCharges)}
                    </div>
                  </div>
                </div>

                {/* Origin Charges Section */}
                <div className="border-t border-border">
                  <div className="px-3 py-3 bg-muted/50 text-center">
                    {/* Header placeholder */}
                  </div>
                  <div className="divide-y divide-border">
                    <div className="px-3 py-2 text-xs text-center">
                      {formatRate(20, 1, 'BL')}
                    </div>
                    <div className="px-3 py-2 text-xs text-center">
                      {formatRate(10, 2, 'CONTAINER')}
                    </div>
                    <div className="px-3 py-2 text-xs text-center">
                      {formatRate(10, 2, 'CONTAINER')}
                    </div>
                    <div className="px-3 py-2 text-xs text-center">
                      {formatRate(20, 2, "CONTAINER 20'")}
                    </div>
                    <div className="px-3 py-2 text-xs text-center">
                      {formatRate(100, 2, 'CONTAINER')}
                    </div>
                    <div className="px-3 py-2 text-sm font-semibold text-center">
                      {formatCurrency(originCharges > 0 ? originCharges : 300)}
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-border divide-y divide-border">
                  <div className="px-3 py-3 text-center">
                    {/* Total charges header placeholder */}
                  </div>
                  <div className="px-3 py-2 text-sm font-bold text-center flex items-center justify-center gap-1">
                    {formatCurrency(totalCost)}
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="px-3 py-2 text-sm text-center flex items-center justify-center gap-1">
                    {formatCurrency(totalCost / 2)}
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
