import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Save,
  Ship,
  Plane,
  Truck,
  Train,
  Calendar,
  Users,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Rfq, RfqStatus, TransportMode } from '@/types/procurement';

interface RfqDetailHeaderProps {
  rfq: Rfq;
  onBack: () => void;
}

const statusConfig: Record<RfqStatus, { label: string; className: string }> = {
  draft: { label: 'DRAFT', className: 'bg-secondary text-secondary-foreground' },
  published: { label: 'PUBLISHED', className: 'bg-info text-info-foreground' },
  bidding: { label: 'BIDDING', className: 'bg-accent text-accent-foreground' },
  evaluation: { label: 'EVALUATION', className: 'bg-warning text-warning-foreground' },
  awarded: { label: 'CONFIRMED', className: 'bg-success text-success-foreground' },
  cancelled: { label: 'CANCELLED', className: 'bg-destructive text-destructive-foreground' },
  expired: { label: 'EXPIRED', className: 'bg-muted text-muted-foreground' },
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
  ocean_fcl: 'FCL EXPORT',
  ocean_lcl: 'LCL EXPORT',
  air: 'AIR EXPORT',
  road_ftl: 'FTL',
  road_ltl: 'LTL',
  rail: 'RAIL',
};

export function RfqDetailHeader({ rfq, onBack }: RfqDetailHeaderProps) {
  const status = statusConfig[rfq.status as RfqStatus] || statusConfig.draft;
  const ModeIcon = modeIcons[rfq.mode as TransportMode] || Ship;
  const lanes = rfq.lanes || [];
  const quoteCount = rfq.quotes?.length || 0;

  // Get origin and destination from first lane
  const firstLane = lanes[0];
  const originDisplay = firstLane 
    ? `${firstLane.origin_city || 'Origin'}, ${firstLane.origin_country || ''}`
    : 'Origin not set';
  const destinationDisplay = firstLane 
    ? `${firstLane.destination_city || 'Destination'}, ${firstLane.destination_country || ''}`
    : 'Destination not set';

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex items-start justify-between bg-card rounded-lg p-4 border border-border">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="space-y-2">
            {/* Title and Status */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">
                {rfq.rfq_number} {rfq.title && `/ ${rfq.title}`}
              </h1>
              <Badge className={cn("text-xs font-semibold", status.className)}>
                {status.label}
              </Badge>
            </div>

            {/* Meta info row */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {rfq.bid_deadline 
                    ? `Closed on: ${format(new Date(rfq.bid_deadline), 'dd/MM/yyyy HH:mm')}`
                    : 'Deadline not set'
                  }
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Submissions: {quoteCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route and cargo info */}
        <div className="flex items-center gap-8">
          {/* Origin/Destination */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-success" />
              <span>{originDisplay}</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-destructive" />
              <span>{destinationDisplay}</span>
            </div>
          </div>

          {/* Cargo type */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
            <ModeIcon className="h-4 w-4" />
            <div className="text-sm">
              <p className="font-medium">{modeLabels[rfq.mode as TransportMode]} ({rfq.incoterms || 'FOB'})</p>
              <p className="text-xs text-muted-foreground">GID: {rfq.rfq_number}</p>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-muted/50 px-6 py-3 rounded-lg">
        <h2 className="text-lg font-semibold">
          {rfq.status === 'awarded' ? 'Enquiry Archived' : 
           rfq.status === 'evaluation' ? 'Enquiry In Evaluation' :
           rfq.status === 'bidding' ? 'Enquiry Active' :
           rfq.status === 'published' ? 'Enquiry Published' :
           'Enquiry Draft'}
        </h2>
      </div>
    </div>
  );
}
