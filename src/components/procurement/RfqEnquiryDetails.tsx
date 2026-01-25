import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ship, 
  Plane, 
  Truck, 
  Train,
  Calendar,
  Package,
  FileText,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import type { Rfq, RfqLane, TransportMode } from '@/types/procurement';

interface RfqEnquiryDetailsProps {
  rfq: Rfq;
  lanes: RfqLane[];
}

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

export function RfqEnquiryDetails({ rfq, lanes }: RfqEnquiryDetailsProps) {
  const ModeIcon = modeIcons[rfq.mode as TransportMode] || Ship;

  return (
    <div className="space-y-6">
      {/* RFQ Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            RFQ Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">RFQ Number</p>
              <p className="font-medium">{rfq.rfq_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{rfq.title || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transport Mode</p>
              <div className="flex items-center gap-2">
                <ModeIcon className="h-4 w-4 text-accent" />
                <span className="font-medium">{modeLabels[rfq.mode as TransportMode]}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Incoterms</p>
              <p className="font-medium">{rfq.incoterms || 'FOB'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract Duration</p>
              <p className="font-medium">{rfq.contract_duration_months || 12} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Annual Volume</p>
              <p className="font-medium">{rfq.estimated_annual_volume || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bid Deadline</p>
              <p className="font-medium">
                {rfq.bid_deadline 
                  ? format(new Date(rfq.bid_deadline), 'MMM d, yyyy HH:mm')
                  : '—'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
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
        </CardContent>
      </Card>

      {/* Lanes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lanes ({lanes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lanes.map((lane, index) => (
              <div 
                key={lane.id} 
                className="p-4 rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Lane {lane.lane_number}</h4>
                  {lane.is_awarded && (
                    <Badge className="bg-success text-success-foreground">Awarded</Badge>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Origin</p>
                    <p className="font-medium">
                      {lane.origin_city}, {lane.origin_country}
                      {lane.origin_port_code && ` (${lane.origin_port_code})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Destination</p>
                    <p className="font-medium">
                      {lane.destination_city}, {lane.destination_country}
                      {lane.destination_port_code && ` (${lane.destination_port_code})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Equipment Type</p>
                    <p className="font-medium">{lane.equipment_type || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Volume</p>
                    <p className="font-medium">{lane.estimated_volume || '—'}</p>
                  </div>
                  {lane.weight_value && (
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{lane.weight_value} {lane.weight_unit}</p>
                    </div>
                  )}
                  {lane.volume_cbm && (
                    <div>
                      <p className="text-muted-foreground">Volume (CBM)</p>
                      <p className="font-medium">{lane.volume_cbm}</p>
                    </div>
                  )}
                  {lane.frequency && (
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="font-medium">{lane.frequency}</p>
                    </div>
                  )}
                  {lane.special_requirements && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Special Requirements</p>
                      <p className="font-medium">{lane.special_requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {lanes.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No lanes defined for this RFQ.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
