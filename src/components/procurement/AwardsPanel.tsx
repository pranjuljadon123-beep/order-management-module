import { useAwardsByRfq, useLockAward, useGenerateRateCard } from '@/hooks/useProcurement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Lock, 
  FileText, 
  Loader2, 
  CheckCircle2,
  Award as AwardIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Award, Carrier, RfqLane } from '@/types/procurement';

interface AwardsPanelProps {
  rfqId: string;
}

export function AwardsPanel({ rfqId }: AwardsPanelProps) {
  const { data: awards, isLoading } = useAwardsByRfq(rfqId);
  const lockAward = useLockAward();
  const generateRateCard = useGenerateRateCard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!awards || awards.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <AwardIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Awards Yet</h3>
        <p className="text-muted-foreground">
          Awards will appear here once lanes are awarded to carriers.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleLock = async (awardId: string) => {
    await lockAward.mutateAsync(awardId);
  };

  const handleGenerateRateCard = async (awardId: string) => {
    await generateRateCard.mutateAsync(awardId);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Lane Awards</h3>
            <p className="text-sm text-muted-foreground">
              {awards.length} lane{awards.length !== 1 ? 's' : ''} awarded
            </p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Award ID</TableHead>
            <TableHead>Lane</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Awarded Rate</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Awarded On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {awards.map((award, index) => {
            const carrier = award.carrier as Carrier;
            const lane = award.lane as RfqLane;

            return (
              <TableRow
                key={award.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <TableCell className="font-medium">
                  {award.award_number}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {lane?.origin_city} → {lane?.destination_city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lane {lane?.lane_number}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{carrier?.name}</p>
                    <p className="text-xs text-muted-foreground">{carrier?.code}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-success">
                  {formatCurrency(award.awarded_rate, award.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {award.award_type}
                    {award.award_type === 'split' && ` (${award.allocation_percentage}%)`}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(award.awarded_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {award.is_locked ? (
                    <Badge className="bg-success-light text-success">
                      <Lock className="mr-1 h-3 w-3" />
                      Locked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-warning">
                      Pending Lock
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!award.is_locked && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLock(award.id)}
                      disabled={lockAward.isPending}
                    >
                      {lockAward.isPending ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Lock className="mr-1 h-3 w-3" />
                      )}
                      Lock
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleGenerateRateCard(award.id)}
                    disabled={generateRateCard.isPending}
                  >
                    {generateRateCard.isPending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="mr-1 h-3 w-3" />
                    )}
                    Rate Card
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
