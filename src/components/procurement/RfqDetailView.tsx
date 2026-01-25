import { useState } from 'react';
import { useRfq, useAwardsByRfq } from '@/hooks/useProcurement';
import { Loader2 } from 'lucide-react';
import { RfqDetailHeader } from './RfqDetailHeader';
import { RfqDetailTabs } from './RfqDetailTabs';

interface RfqDetailViewProps {
  rfqId: string;
  onBack: () => void;
  isVendor?: boolean;
}

export function RfqDetailView({ rfqId, onBack, isVendor = false }: RfqDetailViewProps) {
  const { data: rfq, isLoading } = useRfq(rfqId);
  const { data: awards } = useAwardsByRfq(rfqId);

  if (isLoading || !rfq) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const lanes = rfq.lanes || [];

  return (
    <div className="space-y-6">
      <RfqDetailHeader rfq={rfq} onBack={onBack} />
      <RfqDetailTabs rfq={rfq} lanes={lanes} isVendor={isVendor} />
    </div>
  );
}
