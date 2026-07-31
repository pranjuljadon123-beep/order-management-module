import { useQuotesByLane } from '@/hooks/useProcurement';
import { useConfirmQuote, useSetRfqWorkflowStatus } from '@/hooks/useRfqLifecycle';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateDispatchDialog } from '@/components/dispatch/CreateDispatchDialog';
import { useDispatches } from '@/hooks/useTeamsUsers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  deriveRfqStatus,
  computeAllocation,
  validateAllocation,
  isContainerMode,
} from '@/lib/rfqWorkflow';
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
  /** Full RFQ record — the single source of truth for status + allocation. */
  rfq?: any;
}

export function VendorQuoteGrid({ lane, rfqId, rfqStatus, isVendor = false, bidDeadline, rfq }: VendorQuoteGridProps) {
  const { data: quotes, isLoading } = useQuotesByLane(lane.id);
  const navigate = useNavigate();
  const confirmQuote = useConfirmQuote();
  const setWorkflowStatus = useSetRfqWorkflowStatus();
  const { dispatches } = useDispatches();
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchPrefill, setDispatchPrefill] = useState<any>(null);
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [showCharges, setShowCharges] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<{ quote: Quote; rank: number; intent?: 'confirm' | 'dispatch' } | null>(null);
  const [allocQty, setAllocQty] = useState('1');

  const rfqRecord = rfq ?? { status: rfqStatus, bid_deadline: bidDeadline };
  const derived = deriveRfqStatus(rfqRecord);
  const bidsOpen = derived.bidsOpen;
  const bidsClosed = !bidsOpen;
  // Required quantity can come from the RFQ, the lane, or (for seeded/legacy data)
  // be parsed out of the lane's estimated volume string e.g. "40 units".
  const parsedLaneVolume = parseInt(String(lane.estimated_volume ?? '').replace(/[^0-9]/g, ''), 10);
  const requiredQty =
    Number(rfqRecord.required_quantity) ||
    Number(lane.quantity) ||
    (Number.isFinite(parsedLaneVolume) ? parsedLaneVolume : 0) ||
    1;
  const allocation = computeAllocation(requiredQty, Number(rfqRecord.allocated_quantity) || 0);

  const dispatchForQuote = (quoteId: string) =>
    dispatches.find((d) => d.quoteId === quoteId);

  const openDispatch = (quote: Quote, carrier: Carrier, allocatedQty?: number) => {
    const qty = allocatedQty ?? Number(lane.quantity) ?? 1;
    setDispatchPrefill({
      team: rfqRecord.team || 'Demo USD',
      poNumber: rfqRecord.po_number || rfqRecord.rfq_number || '',
      vendor: carrier?.name || '',
      rfqId,
      rfqNumber: rfqRecord.rfq_number,
      quoteId: quote.id,
      laneId: lane.id,
      originPort: lane.origin_port || `${lane.origin_city}${lane.origin_country ? ', ' + lane.origin_country : ''}`,
      destinationPort: lane.destination_port || `${lane.destination_city}${lane.destination_country ? ', ' + lane.destination_country : ''}`,
      mode: isContainerMode(rfqRecord.mode) ? 'FCL' : 'LCL',
      incoterm: rfqRecord.incoterms || undefined,
      type: rfqRecord.type || 'Export',
      pickDrop: rfqRecord.pick_drop || undefined,
      containers: isContainerMode(rfqRecord.mode)
        ? [{ size: lane.equipment_type || '40ft', qty }]
        : undefined,
      quotes: [
        {
          quoteId: quote.id,
          vendor: carrier?.name || 'Vendor',
          rate: quote.total_landed_cost || quote.base_freight_rate,
          currency: quote.currency,
          allocatedQuantity: qty,
          transitDays: quote.transit_time_days,
        },
      ],
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

  /** Opens the confirmation modal — confirmation is never a one-click action. */
  const openConfirm = (quote: Quote, rank: number, intent: 'confirm' | 'dispatch' = 'confirm') => {
    if (!bidsClosed) {
      toast.error('Bidding is still open', {
        description: 'You can confirm a vendor only after the bid window has closed.',
      });
      return;
    }
    setAllocQty(String(allocation.remaining || 1));
    setConfirmTarget({ quote, rank, intent });
  };

  const runConfirm = async (thenDispatch: boolean) => {
    if (!confirmTarget) return;
    const qty = parseInt(allocQty, 10);
    const problem = validateAllocation(qty, allocation);
    if (problem) return toast.error(problem);

    const quote = confirmTarget.quote;
    const res = await confirmQuote.mutateAsync({
      rfqId,
      laneId: lane.id,
      quoteId: quote.id,
      carrierId: quote.carrier_id,
      awardedRate: quote.total_landed_cost || quote.base_freight_rate,
      currency: quote.currency,
      allocatedQuantity: qty,
    });
    toast.success(
      res.fully
        ? 'Fully allocated — RFQ closed. Create the dispatch to hand over to operations.'
        : `Confirmed ${qty} unit(s). ${res.required - res.nextAllocated} still open for other vendors.`
    );
    setConfirmTarget(null);
    if (thenDispatch) openDispatch(quote, quote.carrier as Carrier, qty);
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

  const canAward = bidsClosed && !isVendor && allocation.remaining > 0;

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
      {allocation.required > 0 && (
        <span className="text-xs text-muted-foreground">
          Allocated {allocation.allocated}/{allocation.required} · {allocation.remaining} remaining
        </span>
      )}
      {bidsOpen && !isVendor && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setWorkflowStatus.mutate({ rfqId, status: 'MY_APPROVAL' })}
          disabled={setWorkflowStatus.isPending}
        >
          <Lock className="h-3 w-3 mr-1 shrink-0" />
          Close Bids & Start Evaluation
        </Button>
      )}
      {canAward && sortedQuotes[0] && (
        <Button
          size="sm"
          className="bg-success text-success-foreground hover:bg-success/90"
          onClick={() => openConfirm(sortedQuotes[0], 1)}
          disabled={confirmQuote.isPending}
        >
          <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />
          Confirm L1 Quote
        </Button>
      )}
      {lane.is_awarded && !isVendor && (() => {
        const confirmedQuote = sortedQuotes.find((q) => q.status === 'accepted');
        const existing = confirmedQuote ? dispatchForQuote(confirmedQuote.id) : null;
        if (!confirmedQuote || existing) return null;
        return (
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => openDispatch(confirmedQuote, confirmedQuote.carrier as Carrier)}
          >
            <Truck className="h-3 w-3 mr-1 shrink-0" />
            Create Dispatch
          </Button>
        );
      })()}
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
                <Filter className="h-3 w-3 mr-1 shrink-0" />
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
                  "w-64 flex-shrink-0 border-r border-border",
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
                      className="w-full text-xs px-2"
                      onClick={() => setDetailQuote(quote)}
                    >
                      <Eye className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">View Complete Quote</span>
                    </Button>

                    {existingDispatch ? (
                      <Button
                        size="sm"
                        className="w-full text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => toast.success(`Dispatch ${existingDispatch.dispatchNumber} already created`, { description: 'Open the Shipments module to continue execution.' })}
                      >
                        <Truck className="h-3 w-3 mr-1 shrink-0" />
                        <span className="truncate">Dispatch Created</span>
                      </Button>
                    ) : isConfirmed ? (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs px-2"
                          onClick={() => toast.success(`Reconfirmation request sent to ${carrier?.name ?? 'vendor'}`)}
                        >
                          Reconfirm Quote
                        </Button>
                        <Button
                          size="sm"
                          className="w-full text-xs px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => openDispatch(quote, carrier)}
                        >
                          <Truck className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate">Create Dispatch</span>
                        </Button>
                      </div>
                    ) : canAward ? (
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          className="w-full text-xs px-2 bg-success text-success-foreground hover:bg-success/90"
                          onClick={() => openConfirm(quote, sortedQuotes.indexOf(quote) + 1)}
                          disabled={confirmQuote.isPending}
                        >
                          {confirmQuote.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />
                              <span className="truncate">Confirm Quote</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="w-full text-xs px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => openConfirm(quote, sortedQuotes.indexOf(quote) + 1, 'dispatch')}
                          disabled={confirmQuote.isPending}
                        >
                          <Truck className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate">Create Dispatch</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs px-2"
                          onClick={() => toast.info('Negotiation thread opened', { description: `Sending counter-offer request to ${carrier?.name ?? 'vendor'}.` })}
                        >
                          Negotiate
                        </Button>
                      </div>
                    ) : bidsOpen ? (
                      <Button size="sm" variant="outline" className="w-full text-xs px-2" disabled>
                        <Lock className="h-3 w-3 mr-1 shrink-0" />
                        <span className="truncate">Locked until bids close</span>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full text-xs px-2" disabled>
                        <span className="truncate">{lane.is_awarded ? 'Awarded to another vendor' : 'Not selected'}</span>
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs min-w-0 px-2"
                        onClick={() => toast.info(`Open conversation with ${carrier?.name ?? 'vendor'}`)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1 shrink-0" />
                        <span className="truncate">Messages</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs min-w-0 px-2">
                            <span className="truncate">More Options</span>
                            <ChevronDown className="h-3 w-3 ml-1 shrink-0" />
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
        onCreated={(d: any) => navigate(`/dispatch/${d.id}`)}
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

    {/* Confirm quote — allocation aware, never a silent one-click award */}
    <Dialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Confirm L{confirmTarget?.rank} quote — {(confirmTarget?.quote.carrier as Carrier)?.name}
          </DialogTitle>
        </DialogHeader>
        {confirmTarget && (
          <div className="space-y-4 text-sm min-w-0">
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 min-w-0">
              <div className="min-w-0">
                <p className="text-muted-foreground">Rate</p>
                <p className="font-semibold truncate">
                  {formatCurrency(
                    confirmTarget.quote.total_landed_cost || confirmTarget.quote.base_freight_rate,
                    confirmTarget.quote.currency
                  )}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground">Transit</p>
                <p className="font-semibold truncate">{confirmTarget.quote.transit_time_days ?? '-'} days</p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground">Lane</p>
                <p className="font-semibold truncate">
                  {lane.origin_city} → {lane.destination_city}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-semibold truncate">
                  {allocation.required > 0 ? `${allocation.remaining} of ${allocation.required}` : 'Not tracked'}
                </p>
              </div>
            </div>
            <div>
              <Label>Allocate quantity *</Label>
              <Input
                className="mt-2"
                type="number"
                min={1}
                max={allocation.required > 0 ? allocation.remaining : undefined}
                value={allocQty}
                onChange={(e) => setAllocQty(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Allocate less than the remaining quantity to split this RFQ across multiple vendors.
              </p>
            </div>
          </div>
        )}
        <DialogFooter className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setConfirmTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={confirmQuote.isPending}
            onClick={() => runConfirm(false)}
          >
            Confirm only
          </Button>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            disabled={confirmQuote.isPending}
            onClick={() => runConfirm(true)}
          >
            {confirmQuote.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Truck className="mr-1 h-4 w-4" />
                Confirm &amp; Create Dispatch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
