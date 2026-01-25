import { useQuotesByLane, useCreateAward } from '@/hooks/useProcurement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Star, 
  Loader2,
  MoreVertical,
  MessageSquare,
  Info,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqLane, Quote, Carrier, Surcharge, RfqStatus } from '@/types/procurement';

interface VendorQuoteGridProps {
  lane: RfqLane;
  rfqId: string;
  rfqStatus: string;
  isVendor?: boolean;
}

export function VendorQuoteGrid({ lane, rfqId, rfqStatus, isVendor = false }: VendorQuoteGridProps) {
  const { data: quotes, isLoading } = useQuotesByLane(lane.id);
  const createAward = useCreateAward();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  // Get all quotes for the lane (including accepted ones for display)
  const allQuotes = quotes || [];
  
  if (allQuotes.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
        No quotes submitted for this lane yet.
      </div>
    );
  }

  // Sort by total cost
  const sortedQuotes = [...allQuotes].sort((a, b) => 
    (a.total_landed_cost || a.base_freight_rate) - (b.total_landed_cost || b.base_freight_rate)
  );

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
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + currency;
  };

  const getCarrierReliability = (carrierId: string) => {
    const hash = carrierId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return 30 + (Math.abs(hash) % 40);
  };

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

  // Row definitions for the comparison grid
  const rows = [
    { key: 'allocated', label: 'Allocated Quantity' },
    { key: 'carrier', label: 'Carrier' },
    { key: 'transit', label: 'Transit Time' },
    { key: 'tranship', label: 'Transhipment Via' },
    { key: 'detention_origin', label: 'Detention Free Time At Origin' },
    { key: 'detention_dest', label: 'Detention Free Time At Destination' },
    { key: 'demurrage_origin', label: 'Demurrage Free Time At Origin' },
    { key: 'demurrage_dest', label: 'Demurrage Free Time At Destination' },
    { key: 'freedays_dest', label: 'Free Days At Warehouse At Destination' },
    { key: 'freedays_origin', label: 'Free Days At Warehouse At Origin' },
    { key: 'combined_free', label: 'Combined Free Time At Destination' },
  ];

  const getRowValue = (quote: Quote, carrier: Carrier, key: string): string => {
    const reliability = getCarrierReliability(quote.carrier_id);
    
    switch (key) {
      case 'allocated':
        return lane.quantity?.toString() || '-';
      case 'carrier':
        return `${carrier?.code || '-'} | ${reliability}%`;
      case 'transit':
        return quote.transit_time_days ? `${quote.transit_time_days} days` : '-';
      case 'tranship':
        return '-'; // Would come from quote details
      case 'detention_origin':
      case 'demurrage_origin':
      case 'freedays_origin':
        return '-';
      case 'detention_dest':
        return '21 days';
      case 'demurrage_dest':
      case 'freedays_dest':
      case 'combined_free':
        return '0 days';
      default:
        return '-';
    }
  };

  const canAward = rfqStatus === 'evaluation' && !lane.is_awarded && !isVendor;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <ScrollArea className="w-full">
        <div className="flex min-w-max">
          {/* Left sidebar with row labels */}
          <div className="w-64 flex-shrink-0 border-r border-border bg-muted/30">
            {/* Header */}
            <div className="h-40 p-4 flex flex-col justify-end border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Vendor</span>
              </div>
              <span className="text-sm text-muted-foreground mb-2">Price</span>
              <Button variant="outline" size="sm" className="w-fit">
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </Button>
            </div>
            
            {/* Row labels */}
            <div className="divide-y divide-border">
              {rows.map((row) => (
                <div key={row.key} className="px-4 py-3 text-sm text-muted-foreground">
                  {row.label}
                </div>
              ))}
            </div>
          </div>

          {/* Vendor columns */}
          {sortedQuotes.map((quote, index) => {
            const carrier = quote.carrier as Carrier;
            const totalCost = quote.total_landed_cost || quote.base_freight_rate;
            const rank = index + 1;
            const isConfirmed = quote.status === 'accepted';
            const reliability = getCarrierReliability(quote.carrier_id);

            return (
              <div 
                key={quote.id} 
                className={cn(
                  "w-56 flex-shrink-0 border-r border-border",
                  rank === 1 && "bg-success/5"
                )}
              >
                {/* Vendor Header */}
                <div className="h-40 p-4 text-center relative border-b border-border">
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
                  <p className="text-lg font-bold mt-2">{formatCurrency(totalCost, quote.currency)}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        rank === 1 && "border-accent text-accent font-semibold"
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
                    <p className="text-xs text-success mt-1 font-medium">
                      Confirmed By: Admin
                    </p>
                  )}
                </div>

                {/* Row values */}
                <div className="divide-y divide-border">
                  {rows.map((row) => {
                    const value = getRowValue(quote, carrier, row.key);
                    const isCarrier = row.key === 'carrier';
                    
                    return (
                      <div key={row.key} className="px-3 py-3 text-sm text-center">
                        {isCarrier ? (
                          <span>
                            <span className="font-medium">{carrier?.code || '-'}</span>
                            {' | '}
                            <span className={cn(
                              "font-semibold",
                              reliability >= 50 ? "text-success" : "text-warning"
                            )}>
                              {reliability}%
                            </span>
                            <Info className="inline h-3 w-3 ml-1 text-muted-foreground" />
                          </span>
                        ) : (
                          value
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action buttons - only for buyers */}
                {!isVendor && (
                  <div className="p-3 border-t border-border space-y-2">
                    {isConfirmed ? (
                      <div className="grid grid-cols-2 gap-1">
                        <Button size="sm" variant="outline" className="text-xs">
                          Reconfirm
                        </Button>
                        <Button size="sm" className="text-xs bg-accent hover:bg-accent/90">
                          Dispatch
                        </Button>
                      </div>
                    ) : canAward ? (
                      <div className="grid grid-cols-2 gap-1">
                        <Button 
                          size="sm" 
                          className="text-xs bg-success hover:bg-success/90"
                          onClick={() => handleAward(quote)}
                          disabled={createAward.isPending}
                        >
                          {createAward.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Confirm
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Negotiate
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                        {lane.is_awarded ? 'Lane Awarded' : 'Pending Evaluation'}
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Messages
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
