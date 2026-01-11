import { useState } from 'react';
import { useRfq, useUpdateRfqStatus, useAwardsByRfq } from '@/hooks/useProcurement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { QuoteComparison } from './QuoteComparison';
import { SubmitQuoteDialog } from './SubmitQuoteDialog';
import { AwardsPanel } from './AwardsPanel';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Ship,
  Plane,
  Truck,
  Train,
  Calendar,
  Package,
  MapPin,
  Loader2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { RfqStatus, TransportMode } from '@/types/procurement';

interface RfqDetailViewProps {
  rfqId: string;
  onBack: () => void;
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

const modeIcons: Record<TransportMode, typeof Ship> = {
  ocean_fcl: Ship,
  ocean_lcl: Ship,
  air: Plane,
  road_ftl: Truck,
  road_ltl: Truck,
  rail: Train,
};

const modeLabels: Record<TransportMode, string> = {
  ocean_fcl: 'Ocean FCL',
  ocean_lcl: 'Ocean LCL',
  air: 'Air Freight',
  road_ftl: 'Road FTL',
  road_ltl: 'Road LTL',
  rail: 'Rail',
};

export function RfqDetailView({ rfqId, onBack }: RfqDetailViewProps) {
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  
  const { data: rfq, isLoading } = useRfq(rfqId);
  const { data: awards } = useAwardsByRfq(rfqId);
  const updateStatus = useUpdateRfqStatus();

  if (isLoading || !rfq) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const status = statusConfig[rfq.status as RfqStatus];
  const StatusIcon = status.icon;
  const ModeIcon = modeIcons[rfq.mode as TransportMode] || Ship;
  const lanes = rfq.lanes || [];
  const quoteCount = rfq.quotes?.length || 0;
  const awardedLanes = lanes.filter(l => l.is_awarded).length;

  const handlePublish = () => {
    updateStatus.mutate({ id: rfq.id, status: 'published' });
  };

  const handleStartEvaluation = () => {
    updateStatus.mutate({ id: rfq.id, status: 'evaluation' });
  };

  const handleMarkAwarded = () => {
    updateStatus.mutate({ id: rfq.id, status: 'awarded' });
  };

  const openQuoteDialog = (laneId: string) => {
    setSelectedLaneId(laneId);
    setShowQuoteDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{rfq.rfq_number}</h1>
              <span className={cn("status-badge capitalize", status.variant)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{rfq.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rfq.status === 'draft' && (
            <Button 
              onClick={handlePublish}
              className="bg-accent hover:bg-accent/90"
              disabled={updateStatus.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Publish RFQ
            </Button>
          )}
          {(rfq.status === 'published' || rfq.status === 'bidding') && (
            <Button 
              onClick={handleStartEvaluation}
              variant="outline"
              disabled={updateStatus.isPending}
            >
              Start Evaluation
            </Button>
          )}
          {rfq.status === 'evaluation' && awardedLanes === lanes.length && lanes.length > 0 && (
            <Button 
              onClick={handleMarkAwarded}
              className="bg-success hover:bg-success/90 text-success-foreground"
              disabled={updateStatus.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete RFQ
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-light">
              <ModeIcon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transport Mode</p>
              <p className="font-semibold">{modeLabels[rfq.mode as TransportMode]}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-light">
              <MapPin className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lanes</p>
              <p className="font-semibold">{lanes.length} lanes</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quotes</p>
              <p className="font-semibold">{quoteCount} received</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-light">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="font-semibold">
                {rfq.bid_deadline 
                  ? format(new Date(rfq.bid_deadline), 'MMM d, yyyy')
                  : 'Not set'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="glass-card p-4 rounded-xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">Incoterms</p>
            <p className="font-medium">{rfq.incoterms || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contract Duration</p>
            <p className="font-medium">{rfq.contract_duration_months || 12} months</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Annual Volume</p>
            <p className="font-medium">{rfq.estimated_annual_volume || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{format(new Date(rfq.created_at), 'MMM d, yyyy')}</p>
          </div>
        </div>
        {rfq.notes && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{rfq.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lanes" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="lanes">
            Lanes & Quotes ({lanes.length})
          </TabsTrigger>
          <TabsTrigger value="awards">
            Awards ({awards?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lanes" className="space-y-6">
          {lanes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No lanes defined for this RFQ.
            </div>
          ) : (
            lanes.map((lane) => (
              <div key={lane.id} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">
                      {lane.origin_city} → {lane.destination_city}
                    </span>
                    {lane.is_awarded && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Awarded
                      </Badge>
                    )}
                  </div>
                  {!lane.is_awarded && rfq.status !== 'awarded' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openQuoteDialog(lane.id)}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Quote
                    </Button>
                  )}
                </div>
                <QuoteComparison lane={lane} rfqId={rfq.id} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="awards">
          <AwardsPanel rfqId={rfq.id} />
        </TabsContent>
      </Tabs>

      {/* Quote Dialog */}
      {selectedLaneId && (
        <SubmitQuoteDialog
          open={showQuoteDialog}
          onOpenChange={setShowQuoteDialog}
          rfqId={rfq.id}
          laneId={selectedLaneId}
        />
      )}
    </div>
  );
}
