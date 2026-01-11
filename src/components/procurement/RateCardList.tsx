import { useState } from 'react';
import { useRateCards } from '@/hooks/useProcurement';
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
  Search, 
  FileText, 
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { RateCard, Carrier } from '@/types/procurement';

export function RateCardList() {
  const [search, setSearch] = useState('');
  const { data: rateCards, isLoading } = useRateCards();

  const filteredCards = (rateCards || []).filter(rc =>
    rc.rate_card_number.toLowerCase().includes(search.toLowerCase()) ||
    rc.origin.toLowerCase().includes(search.toLowerCase()) ||
    rc.destination.toLowerCase().includes(search.toLowerCase()) ||
    (rc.carrier as Carrier)?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getValidityStatus = (validFrom: string, validTo: string) => {
    const now = new Date();
    const from = new Date(validFrom);
    const to = new Date(validTo);
    const warningDate = addDays(now, 30);

    if (isBefore(to, now)) {
      return { label: 'Expired', variant: 'bg-destructive/10 text-destructive', icon: AlertCircle };
    }
    if (isBefore(to, warningDate)) {
      return { label: 'Expiring Soon', variant: 'bg-warning-light text-warning', icon: Calendar };
    }
    if (isAfter(from, now)) {
      return { label: 'Future', variant: 'bg-info-light text-info', icon: Calendar };
    }
    return { label: 'Active', variant: 'bg-success-light text-success', icon: CheckCircle2 };
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
            placeholder="Search rate cards..."
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
              <TableHead>Rate Card</TableHead>
              <TableHead>Lane</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Total Rate</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rate cards found.</p>
                  <p className="text-sm">Rate cards are generated from awarded lanes.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCards.map((rc, index) => {
                const carrier = rc.carrier as Carrier;
                const validityStatus = getValidityStatus(rc.valid_from, rc.valid_to);
                const ValidityIcon = validityStatus.icon;

                return (
                  <TableRow
                    key={rc.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <TableCell className="font-medium">
                      {rc.rate_card_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rc.origin}</p>
                        <p className="text-xs text-muted-foreground">→ {rc.destination}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{carrier?.name}</p>
                        <p className="text-xs text-muted-foreground">{carrier?.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {rc.mode.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(rc.base_rate, rc.currency)}
                      {rc.rate_unit && (
                        <span className="text-xs text-muted-foreground">/{rc.rate_unit}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-accent">
                      {rc.total_rate ? formatCurrency(rc.total_rate, rc.currency) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>
                        <p>{format(new Date(rc.valid_from), 'MMM d, yyyy')}</p>
                        <p>→ {format(new Date(rc.valid_to), 'MMM d, yyyy')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("status-badge", validityStatus.variant)}>
                        <ValidityIcon className="h-3 w-3" />
                        {validityStatus.label}
                      </span>
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
