import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Users,
  MessageSquare,
  Truck,
  BarChart3,
  Plus,
  Edit,
  Download,
} from 'lucide-react';
import { VendorQuoteGrid } from './VendorQuoteGrid';
import { RfqEnquiryDetails } from './RfqEnquiryDetails';
import { AwardsPanel } from './AwardsPanel';
import type { Rfq, RfqLane } from '@/types/procurement';
import { toast } from 'sonner';

interface RfqDetailTabsProps {
  rfq: Rfq;
  lanes: RfqLane[];
  isVendor?: boolean;
}

export function RfqDetailTabs({ rfq, lanes, isVendor = false }: RfqDetailTabsProps) {
  const handleDownloadAll = () => {
    const rows = [['Lane', 'Origin', 'Destination', 'Quotes']];
    lanes.forEach((l) => {
      rows.push([
        l.lane_number ?? '',
        `${l.origin_city ?? ''}, ${l.origin_country ?? ''}`,
        `${l.destination_city ?? ''}, ${l.destination_country ?? ''}`,
        String((l as any).quotes?.length ?? 0),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rfq.rfq_number}-quotes.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Quotes exported');
  };

  return (
    <Tabs defaultValue="quotes" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="details" className="gap-2">
            <FileText className="h-4 w-4" />
            Enquiry & Other Details
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2">
            <Users className="h-4 w-4" />
            Vendor Quoting
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Quotes Received
          </TabsTrigger>
          <TabsTrigger value="dispatch" className="gap-2">
            <Truck className="h-4 w-4" />
            Dispatch
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Action buttons - only show for buyers */}
        {!isVendor && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => toast.info('Use "New Auction RFQ" to add another lane to a new RFQ')}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => toast.info('Editing is available while the RFQ is in draft status')}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-accent hover:bg-accent/90"
              onClick={handleDownloadAll}
            >
              <Download className="h-4 w-4" />
              Download All Quotes
            </Button>
          </div>
        )}
      </div>

      <TabsContent value="details">
        <RfqEnquiryDetails rfq={rfq} lanes={lanes} />
      </TabsContent>

      <TabsContent value="vendors">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Invited Vendors</h3>
          {Array.isArray((rfq as any).invited_carriers) && (rfq as any).invited_carriers.length > 0 ? (
            <ul className="divide-y divide-border">
              {(rfq as any).invited_carriers.map((c: any) => (
                <li key={c.id ?? c} className="flex items-center justify-between py-3">
                  <span className="font-medium">{c.name ?? c}</span>
                  <span className="text-sm text-muted-foreground">{c.code ?? ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No invited vendors recorded on this RFQ. Switch to the Quotes Received tab to see who has submitted.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="quotes">
        {lanes.map((lane) => (
          <VendorQuoteGrid 
            key={lane.id} 
            lane={lane} 
            rfqId={rfq.id}
            rfqStatus={rfq.status}
            isVendor={isVendor}
          />
        ))}
      </TabsContent>

      <TabsContent value="dispatch">
        <AwardsPanel rfqId={rfq.id} />
      </TabsContent>

      <TabsContent value="analytics">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Quote Analytics</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Lanes</p>
              <p className="text-2xl font-bold">{lanes.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Quotes Received</p>
              <p className="text-2xl font-bold">{(rfq.quotes?.length ?? 0)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-2xl font-bold capitalize">{rfq.status}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-2">
            <Download className="h-4 w-4" /> Export Analytics CSV
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
