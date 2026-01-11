import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Gavel } from 'lucide-react';
import { AuctionStats } from '@/components/auction/AuctionStats';
import { AuctionRfqList } from '@/components/auction/AuctionRfqList';
import { RateCardList } from '@/components/procurement/RateCardList';
import { CreateRfqDialog } from '@/components/procurement/CreateRfqDialog';
import type { AuctionRfq } from '@/types/auction';

// Simplified detail view for now - full implementation would include BuyerBidComparison
import { RfqDetailView } from '@/components/procurement/RfqDetailView';

const Procurement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<AuctionRfq | null>(null);

  if (selectedRfq) {
    return (
      <AppLayout>
        <RfqDetailView 
          rfqId={selectedRfq.id} 
          onBack={() => setSelectedRfq(null)} 
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Gavel className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Freight Procurement
                </h1>
                <p className="text-muted-foreground">
                  Reverse auction platform for competitive freight bidding
                </p>
              </div>
            </div>
          </div>
          <Button 
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            New Auction RFQ
          </Button>
        </div>
      </div>

      <AuctionStats />

      <div className="mt-8">
        <Tabs defaultValue="auctions" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="rate-cards">Rate Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="auctions">
            <AuctionRfqList onSelectRfq={(rfq) => setSelectedRfq(rfq)} />
          </TabsContent>

          <TabsContent value="rate-cards">
            <RateCardList />
          </TabsContent>
        </Tabs>
      </div>

      <CreateRfqDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </AppLayout>
  );
};

export default Procurement;
