import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { RfqList } from '@/components/procurement/RfqList';
import { RfqDetailView } from '@/components/procurement/RfqDetailView';
import { CreateRfqDialog } from '@/components/procurement/CreateRfqDialog';
import { RateCardList } from '@/components/procurement/RateCardList';
import { ProcurementStats } from '@/components/procurement/ProcurementStats';
import type { Rfq } from '@/types/procurement';

const Procurement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<Rfq | null>(null);

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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Freight Procurement
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create RFQs, compare rates, and award contracts
            </p>
          </div>
          <Button 
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            New RFQ
          </Button>
        </div>
      </div>

      <ProcurementStats />

      <div className="mt-8">
        <Tabs defaultValue="rfqs" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="rfqs">RFQs</TabsTrigger>
            <TabsTrigger value="rate-cards">Rate Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="rfqs">
            <RfqList onSelectRfq={setSelectedRfq} />
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
