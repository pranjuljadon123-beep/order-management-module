import { useState } from 'react';
import { useAuctionRfqs, useUpdateAuctionStatus } from '@/hooks/useAuction';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuctionTimer } from './AuctionTimer';
import {
  Search,
  MoreVertical,
  Eye,
  Play,
  Pause,
  StopCircle,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Activity,
  Ship,
  Plane,
  Truck,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AuctionRfq, AuctionStatus, RfqType } from '@/types/auction';

interface AuctionRfqListProps {
  onSelectRfq: (rfq: AuctionRfq) => void;
}

const statusConfig: Record<AuctionStatus, { label: string; variant: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', variant: 'bg-secondary text-secondary-foreground', icon: FileText },
  scheduled: { label: 'Scheduled', variant: 'bg-info-light text-info', icon: Clock },
  live: { label: 'Live Auction', variant: 'bg-success-light text-success', icon: Activity },
  paused: { label: 'Paused', variant: 'bg-warning-light text-warning', icon: Pause },
  closed: { label: 'Closed', variant: 'bg-muted text-muted-foreground', icon: StopCircle },
  awarded: { label: 'Awarded', variant: 'bg-cyan-light text-accent', icon: Trophy },
  cancelled: { label: 'Cancelled', variant: 'bg-destructive/10 text-destructive', icon: AlertCircle },
};

const modeIcons: Record<string, typeof Ship> = {
  ocean_fcl: Ship,
  ocean_lcl: Ship,
  air: Plane,
  road_ftl: Truck,
  road_ltl: Truck,
  rail: Truck,
};

const modeLabels: Record<string, string> = {
  ocean_fcl: 'Ocean FCL',
  ocean_lcl: 'Ocean LCL',
  air: 'Air Freight',
  road_ftl: 'Road FTL',
  road_ltl: 'Road LTL',
  rail: 'Rail',
};

export function AuctionRfqList({ onSelectRfq }: AuctionRfqListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: rfqs, isLoading } = useAuctionRfqs();
  const updateStatus = useUpdateAuctionStatus();

  const filteredRfqs = (rfqs || []).filter((rfq) => {
    const matchesSearch =
      rfq.rfq_number.toLowerCase().includes(search.toLowerCase()) ||
      rfq.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.auction_status === statusFilter;
    const matchesType = typeFilter === 'all' || rfq.rfq_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStartAuction = (rfq: AuctionRfq) => {
    updateStatus.mutate({ rfqId: rfq.id, status: 'live' });
  };

  const handlePauseAuction = (rfq: AuctionRfq) => {
    updateStatus.mutate({ rfqId: rfq.id, status: 'paused' });
  };

  const handleCloseAuction = (rfq: AuctionRfq) => {
    updateStatus.mutate({ rfqId: rfq.id, status: 'closed' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="spot">Spot</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>RFQ ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Lanes</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Auction Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRfqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No auctions found. Create your first auction RFQ to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredRfqs.map((rfq, index) => {
                const auctionStatus = statusConfig[rfq.auction_status as AuctionStatus] || statusConfig.draft;
                const StatusIcon = auctionStatus.icon;
                const ModeIcon = modeIcons[rfq.mode] || Ship;
                const laneCount = rfq.lanes?.length || 0;
                const bidCount = rfq.bids?.length || 0;
                const auctionEnd = rfq.auction_config?.auction_end;

                return (
                  <TableRow
                    key={rfq.id}
                    className="cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => onSelectRfq(rfq)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {rfq.rfq_number}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{rfq.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-normal capitalize",
                        rfq.rfq_type === 'spot' && "border-warning text-warning",
                        rfq.rfq_type === 'contract' && "border-info text-info"
                      )}>
                        {rfq.rfq_type || 'contract'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ModeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{modeLabels[rfq.mode] || rfq.mode}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{laneCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-semibold",
                        bidCount > 0 ? "text-accent" : "text-muted-foreground"
                      )}>
                        {bidCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {auctionEnd && (rfq.auction_status === 'live' || rfq.auction_status === 'scheduled') ? (
                        <AuctionTimer 
                          endTime={auctionEnd} 
                          startTime={rfq.auction_config?.auction_start}
                          size="sm" 
                        />
                      ) : auctionEnd ? (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(auctionEnd), 'MMM d, HH:mm')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("status-badge capitalize", auctionStatus.variant)}>
                        <StatusIcon className={cn("h-3 w-3", rfq.auction_status === 'live' && "animate-pulse")} />
                        {auctionStatus.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => onSelectRfq(rfq)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {(rfq.auction_status === 'draft' || rfq.auction_status === 'scheduled') && (
                            <DropdownMenuItem onClick={() => handleStartAuction(rfq)}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Auction
                            </DropdownMenuItem>
                          )}
                          {rfq.auction_status === 'live' && (
                            <>
                              <DropdownMenuItem onClick={() => handlePauseAuction(rfq)}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Auction
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCloseAuction(rfq)}>
                                <StopCircle className="mr-2 h-4 w-4" />
                                Close Auction
                              </DropdownMenuItem>
                            </>
                          )}
                          {rfq.auction_status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleStartAuction(rfq)}>
                              <Play className="mr-2 h-4 w-4" />
                              Resume Auction
                            </DropdownMenuItem>
                          )}
                          {rfq.auction_status === 'closed' && (
                            <DropdownMenuItem onClick={() => onSelectRfq(rfq)}>
                              <Trophy className="mr-2 h-4 w-4" />
                              Award Lanes
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
