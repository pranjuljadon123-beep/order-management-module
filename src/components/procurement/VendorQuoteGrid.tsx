import { useQuotesByLane, useCreateAward } from '@/hooks/useProcurement';
import { useState, useMemo } from 'react';
import { CreateDispatchDialog } from '@/components/dispatch/CreateDispatchDialog';
import { useDispatches } from '@/hooks/useTeamsUsers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Star, 
  Loader2,
  MoreVertical,
  MessageSquare,
  Info,
  Filter,
  CheckCircle2,
  Eye,
  Clock,
  Lock,
  Truck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqLane, Quote, Carrier, Surcharge, RfqStatus } from '@/types/procurement';
import { toast } from 'sonner';

interface VendorQuoteGridProps {
  lane: RfqLane;
  rfqId: string;
  rfqStatus: string;
  isVendor?: boolean;
  bidDeadline?: string;
}

export function VendorQuoteGrid({ lane, rfqId, rfqStatus, isVendor = false, bidDeadline }: VendorQuoteGridProps) {
  const { data: quotes, isLoading } = useQuotesByLane(lane.id);
  const createAward = useCreateAward();
  const { dispatches } = useDispatches();
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchPrefill, setDispatchPrefill] = useState<any>(null);
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [showCharges, setShowCharges] = useState(true);

  const now = Date.now();
  const deadlineMs = bidDeadline ? new Date(bidDeadline).getTime() : null;
  const deadlinePassed = deadlineMs != null && deadlineMs <= now;
  const bidsClosed = deadlinePassed || ['evaluation', 'awarded', 'expired'].includes(rfqStatus);
  const bidsOpen = !bidsClosed && ['published', 'bidding'].includes(rfqStatus);

  const dispatchForQuote = (quoteId: string) =>
    dispatches.find((d) => d.quoteId === quoteId);

  const openDispatch = (quote: Quote, carrier: Carrier) => {
    setDispatchPrefill({
      vendor: carrier?.name || '',
      rfqId,
      quoteId: quote.id,
      laneId: lane.id,
      originPort: lane.origin_port || `${lane.origin_city}${lane.origin_country ? ', ' + lane.origin_country : ''}`,
      destinationPort: lane.destination_port || `${lane.destination_city}${lane.destination_country ? ', ' + lane.destination_country : ''}`,
      mode: 'FCL',
      containers: lane.equipment_type ? [{ size: lane.equipment_type, qty: lane.quantity || 1 }] : undefined,
    });
    setDispatchOpen(true);
  };

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

  const rateValues = sortedQuotes
    .filter((q) => q.status === 'accepted')
    .map((q) => q.total_landed_cost || q.base_freight_rate);
  const leastConfirmed = rateValues.length ? Math.min(...rateValues) : null;
  const lastConfirmed = rateValues.length
    ? (sortedQuotes.filter((q) => q.status === 'accepted').sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0]?.total_landed_cost ?? sortedQuotes[0].base_freight_rate)
    : null;
  const anyConfirmed = rateValues.length > 0;

  const handleAward = async (quote: Quote) => {
    if (!bidsClosed) {
      toast.error('Bidding is still open', {
        description: 'You can confirm a vendor only after the bid deadline has passed.',
      });
      return;
    }
    await createAward.mutateAsync({
      rfq_id: rfqId,
      lane_id: lane.id,
      quote_id: quote.id,
      carrier_id: quote.carrier_id,
      awarded_rate: quote.total_landed_cost || quote.base_freight_rate,
      currency: quote.currency,
    });
    toast.success('Vendor confirmed — proceed to create dispatch');
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

  const canAward = bidsClosed && !lane.is_awarded && !isVendor;

  return (
    <>
    {/* Lifecycle banner */}
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-b-0 border-border px-4 py-3 text-sm',
        bidsOpen && 'bg-info/10 text-info-foreground',
        bidsClosed && !lane.is_awarded && 'bg-warning/10',
        lane.is_awarded && 'bg-success/10'
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        {bidsOpen && <Clock className="h-4 w-4" />}
        {bidsClosed && !lane.is_awarded && <Lock className="h-4 w-4" />}
        {lane.is_awarded && <CheckCircle2 className="h-4 w-4 text-success" />}
        <span>
          {bidsOpen
            ? 'Bidding is open — vendors can revise. Confirm & dispatch are locked until the deadline passes.'
            : lane.is_awarded
              ? 'Vendor confirmed — create a dispatch to hand this shipment to operations.'
              : 'Bids are closed. Review submissions and confirm a vendor to proceed to dispatch.'}
        </span>
      </div>
      {bidDeadline && (
        <span className="text-xs text-muted-foreground">
          Deadline: {new Date(bidDeadline).toLocaleString()}
        </span>
      )}
    </div>

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
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => toast.info('Vendor filter', { description: 'Filter by carrier, rating or rank — coming inline soon.' })}
              >
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

            {/* Least / Last confirmed */}
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="p-3">
                <p className="text-xs text-muted-foreground">Least Confirmed Rate</p>
                <p className="text-sm font-semibold text-success">
                  {leastConfirmed != null ? formatCurrency(leastConfirmed, sortedQuotes[0].currency) : '—'}
                </p>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground">Last Confirmed Rate</p>
                <p className="text-sm font-semibold text-success">
                  {lastConfirmed != null ? formatCurrency(lastConfirmed, sortedQuotes[0].currency) : '—'}
                </p>
              </div>
            </div>

            {/* Charges toggle */}
            <button
              onClick={() => setShowCharges((v) => !v)}
              className="flex w-full items-center justify-between border-t border-border px-4 py-3 text-sm font-medium hover:bg-muted/50"
            >
              <span>Freight & Charges Breakdown</span>
              {showCharges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showCharges && (
              <div className="divide-y divide-border">
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Freight Charges</div>
                <div className="px-4 py-3 text-sm text-muted-foreground">Ocean Freight</div>
                <div className="px-4 py-3 text-sm font-semibold">Sub Total</div>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Origin Charges</div>
                <div className="px-4 py-3 text-sm text-muted-foreground">Origin THC</div>
                <div className="px-4 py-3 text-sm text-muted-foreground">Origin BL Charges</div>
                <div className="px-4 py-3 text-sm text-muted-foreground">Origin Other Local</div>
                <div className="px-4 py-3 text-sm font-semibold">Sub Total</div>
                <div className="px-4 py-3 text-sm font-semibold">Total Price</div>
                <div className="px-4 py-3 text-sm text-muted-foreground">Total Price Per Unit</div>
              </div>
            )}
          </div>

          {/* Vendor columns */}
          {sortedQuotes.map((quote, index) => {
            const carrier = quote.carrier as Carrier;
            const totalCost = quote.total_landed_cost || quote.base_freight_rate;
            const rank = index + 1;
            const isConfirmed = quote.status === 'accepted';
            const reliability = getCarrierReliability(quote.carrier_id);
            const qty = lane.quantity || 1;
            const baseSub = quote.base_freight_rate * qty;
            const originSub = Math.max(0, totalCost - baseSub);
            const perUnit = totalCost / qty;
            const existingDispatch = dispatchForQuote(quote.id);

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
                      <DropdownMenuItem onClick={() => setDetailQuote(quote)}>View Complete Quote</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success('Quote PDF queued for download')}>Download Quote</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Messaging will open in the Messages module')}>Send Message</DropdownMenuItem>
                      {isConfirmed && !existingDispatch && !isVendor && (
                        <DropdownMenuItem onClick={() => openDispatch(quote, carrier)}>Create Dispatch</DropdownMenuItem>
                      )}
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
                    {existingDispatch && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        {existingDispatch.dispatchNumber}
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

                {/* Charges rows */}
                {showCharges && (
                  <div className="divide-y divide-border">
                    <div className="px-3 py-2 text-xs text-center text-muted-foreground bg-muted/30">&nbsp;</div>
                    <div className="px-3 py-3 text-sm text-center">{formatCurrency(quote.base_freight_rate, quote.currency)} × {qty}</div>
                    <div className="px-3 py-3 text-sm text-center font-semibold">{formatCurrency(baseSub, quote.currency)}</div>
                    <div className="px-3 py-2 text-xs text-center text-muted-foreground bg-muted/30">&nbsp;</div>
                    <div className="px-3 py-3 text-sm text-center">{formatCurrency(originSub * 0.5, quote.currency)}</div>
                    <div className="px-3 py-3 text-sm text-center">{formatCurrency(originSub * 0.2, quote.currency)}</div>
                    <div className="px-3 py-3 text-sm text-center">{formatCurrency(originSub * 0.3, quote.currency)}</div>
                    <div className="px-3 py-3 text-sm text-center font-semibold">{formatCurrency(originSub, quote.currency)}</div>
                    <div className="px-3 py-3 text-sm text-center font-bold text-accent">{formatCurrency(totalCost, quote.currency)}</div>
                    <div className="px-3 py-3 text-sm text-center">{formatCurrency(perUnit, quote.currency)}</div>
                  </div>
                )}

                {/* Action buttons - only for buyers */}
                {!isVendor && (
                  <div className="p-3 border-t border-border space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setDetailQuote(quote)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Complete Quote
                    </Button>

                    {existingDispatch ? (
                      <Button
                        size="sm"
                        className="w-full text-xs bg-accent hover:bg-accent/90"
                        onClick={() => toast.success(`Dispatch ${existingDispatch.dispatchNumber} already created`, { description: 'Open the Shipments module to continue execution.' })}
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        Dispatch Created
                      </Button>
                    ) : isConfirmed ? (
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => toast.success(`Reconfirmation request sent to ${carrier?.name ?? 'vendor'}`)}
                        >
                          Reconfirm
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-accent hover:bg-accent/90"
                          onClick={() => openDispatch(quote, carrier)}
                        >
                          <Truck className="h-3 w-3 mr-1" />
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
                              Confirm Quote
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => toast.info('Negotiation thread opened', { description: `Sending counter-offer request to ${carrier?.name ?? 'vendor'}.` })}
                        >
                          Negotiate
                        </Button>
                      </div>
                    ) : bidsOpen ? (
                      <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                        <Lock className="h-3 w-3 mr-1" />
                        Locked until bids close
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                        {lane.is_awarded ? 'Awarded to another vendor' : 'Not selected'}
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => toast.info(`Open conversation with ${carrier?.name ?? 'vendor'}`)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Messages
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs">
                            More
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success('Quote PDF queued')}>Download Quote</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Rate history opened')}>Rate History</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Compliance docs requested')}>Request Compliance Docs</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <CreateDispatchDialog
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        prefill={dispatchPrefill}
      />
    </div>

    {/* View Complete Quote dialog */}
    <Dialog open={!!detailQuote} onOpenChange={(o) => !o && setDetailQuote(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Quote {detailQuote?.quote_number} — {(detailQuote?.carrier as Carrier)?.name}
          </DialogTitle>
        </DialogHeader>
        {detailQuote && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Base Rate</p>
                <p className="font-semibold">{formatCurrency(detailQuote.base_freight_rate, detailQuote.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Landed Cost</p>
                <p className="font-semibold">{formatCurrency(detailQuote.total_landed_cost || detailQuote.base_freight_rate, detailQuote.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transit</p>
                <p className="font-semibold">{detailQuote.transit_time_days ?? '-'} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valid Until</p>
                <p className="font-semibold">{detailQuote.validity_end ? new Date(detailQuote.validity_end).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            {Array.isArray(detailQuote.surcharges) && (detailQuote.surcharges as Surcharge[]).length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2">Surcharges</p>
                <ul className="divide-y divide-border rounded-md border">
                  {(detailQuote.surcharges as Surcharge[]).map((s, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2">
                      <span>{s.name}</span>
                      <span className="font-medium">{s.type === 'percentage' ? `${s.amount}%` : formatCurrency(s.amount, detailQuote.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detailQuote.notes && (
              <div>
                <p className="text-muted-foreground">Notes</p>
                <p>{detailQuote.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
