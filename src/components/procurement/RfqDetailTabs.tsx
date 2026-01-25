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
  Download
} from 'lucide-react';
import { VendorQuoteGrid } from './VendorQuoteGrid';
import { RfqEnquiryDetails } from './RfqEnquiryDetails';
import type { Rfq, RfqLane } from '@/types/procurement';

interface RfqDetailTabsProps {
  rfq: Rfq;
  lanes: RfqLane[];
  isVendor?: boolean;
}

export function RfqDetailTabs({ rfq, lanes, isVendor = false }: RfqDetailTabsProps) {
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
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90">
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
          <p className="text-muted-foreground">
            Vendor quoting management coming soon. View and manage which vendors have been invited and their quote status.
          </p>
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
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Dispatch Management</h3>
          <p className="text-muted-foreground">
            Dispatch functionality coming soon. Create and manage shipment dispatches from awarded quotes.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quote Analytics</h3>
          <p className="text-muted-foreground">
            Analytics dashboard coming soon. View quote comparisons, savings analysis, and vendor performance metrics.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
