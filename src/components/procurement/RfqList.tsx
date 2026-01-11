import { useState } from 'react';
import { useRfqs, useUpdateRfqStatus } from '@/hooks/useProcurement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Send, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Rfq, RfqStatus } from '@/types/procurement';

interface RfqListProps {
  onSelectRfq: (rfq: Rfq) => void;
}

const statusConfig: Record<RfqStatus, { label: string; variant: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', variant: 'bg-secondary text-secondary-foreground', icon: FileText },
  published: { label: 'Published', variant: 'bg-info-light text-info', icon: Send },
  bidding: { label: 'Bidding', variant: 'bg-cyan-light text-accent', icon: Clock },
  evaluation: { label: 'Evaluation', variant: 'bg-warning-light text-warning', icon: AlertCircle },
  awarded: { label: 'Awarded', variant: 'bg-success-light text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'bg-destructive/10 text-destructive', icon: AlertCircle },
  expired: { label: 'Expired', variant: 'bg-muted text-muted-foreground', icon: Clock },
};

const modeLabels: Record<string, string> = {
  ocean_fcl: 'Ocean FCL',
  ocean_lcl: 'Ocean LCL',
  air: 'Air Freight',
  road_ftl: 'Road FTL',
  road_ltl: 'Road LTL',
  rail: 'Rail',
};

export function RfqList({ onSelectRfq }: RfqListProps) {
  const [search, setSearch] = useState('');
  const { data: rfqs, isLoading } = useRfqs();
  const updateStatus = useUpdateRfqStatus();

  const filteredRfqs = (rfqs || []).filter(rfq =>
    rfq.rfq_number.toLowerCase().includes(search.toLowerCase()) ||
    rfq.title.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = (rfq: Rfq) => {
    updateStatus.mutate({ id: rfq.id, status: 'published' });
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>RFQ ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Lanes</TableHead>
              <TableHead>Quotes</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRfqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No RFQs found. Create your first RFQ to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredRfqs.map((rfq, index) => {
                const status = statusConfig[rfq.status as RfqStatus];
                const StatusIcon = status.icon;
                const laneCount = rfq.lanes?.length || 0;
                const quoteCount = rfq.quotes?.length || 0;

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
                    <TableCell className="max-w-[200px] truncate">
                      {rfq.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {modeLabels[rfq.mode] || rfq.mode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{laneCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-semibold",
                        quoteCount > 0 ? "text-accent" : "text-muted-foreground"
                      )}>
                        {quoteCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {rfq.bid_deadline 
                        ? format(new Date(rfq.bid_deadline), 'MMM d, yyyy')
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={cn("status-badge capitalize", status.variant)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
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
                          {rfq.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handlePublish(rfq)}>
                              <Send className="mr-2 h-4 w-4" />
                              Publish RFQ
                            </DropdownMenuItem>
                          )}
                          {rfq.status === 'evaluation' && (
                            <DropdownMenuItem>
                              <Award className="mr-2 h-4 w-4" />
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
