import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDispatches } from '@/hooks/useTeamsUsers';
import { DISPATCH_FLOW, DISPATCH_STATUS_META, type DispatchStatus } from '@/lib/rfqWorkflow';
import { ArrowLeft, Truck, Plus, Radar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DispatchDetail() {
  const { dispatchId = '' } = useParams();
  const navigate = useNavigate();
  const { dispatches, setDispatchStatus, addQuoteToDispatch, removeQuoteFromDispatch, updateDispatch } =
    useDispatches();
  const dispatch = useMemo(
    () => dispatches.find((d) => d.id === dispatchId || d.dispatchNumber === dispatchId),
    [dispatches, dispatchId]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [vendor, setVendor] = useState('');
  const [rate, setRate] = useState('');
  const [qty, setQty] = useState('1');

  if (!dispatch) {
    return (
      <AppLayout>
        <div className="glass-card rounded-xl p-12 text-center space-y-4">
          <p className="text-muted-foreground">This dispatch could not be found.</p>
          <Button variant="outline" onClick={() => navigate('/procurement')}>
            Back to DxProcure
          </Button>
        </div>
      </AppLayout>
    );
  }

  const meta = DISPATCH_STATUS_META[dispatch.status as DispatchStatus] ?? DISPATCH_STATUS_META.NEW_DISPATCH;
  const cf = dispatch.customFields || {};

  const goToTrack = () => {
    // Hand-off payload: everything DxTrack needs to identify the shipment.
    const params = new URLSearchParams({
      gid: dispatch.gid,
      dispatch: dispatch.dispatchNumber,
      vendor: dispatch.vendor,
      pol: dispatch.originPort,
      pod: dispatch.destinationPort,
      mode: dispatch.mode,
      ...(cf.mbl ? { bl: cf.mbl } : {}),
      ...(cf.containerNumber ? { container: cf.containerNumber } : {}),
      ...(cf.eta ? { eta: cf.eta } : {}),
      ...(cf.etd ? { etd: cf.etd } : {}),
      ...(cf.vesselName ? { vessel: cf.vesselName } : {}),
    });
    navigate(`/tracking?${params.toString()}`);
  };

  const Row = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value || '—'}</p>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/procurement')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{dispatch.dispatchNumber}</h1>
                <Badge className={cn('uppercase', meta.className)}>{meta.label}</Badge>
                {dispatch.rfqNumber && <Badge variant="outline">from {dispatch.rfqNumber}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                GID {dispatch.gid} · {dispatch.originPort} → {dispatch.destinationPort}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={dispatch.status}
              onValueChange={(v) => {
                setDispatchStatus(dispatch.id, v as DispatchStatus);
                toast.success(`Dispatch moved to ${DISPATCH_STATUS_META[v as DispatchStatus].label}`);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPATCH_FLOW.map((s) => (
                  <SelectItem key={s} value={s}>
                    {DISPATCH_STATUS_META[s].label}
                  </SelectItem>
                ))}
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2 bg-accent hover:bg-accent/90" onClick={goToTrack}>
              <Radar className="h-4 w-4" />
              Go to DxTrack
            </Button>
          </div>
        </div>

        {/* Lifecycle rail — independent of the RFQ status */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            {DISPATCH_FLOW.map((s, i) => {
              const idx = DISPATCH_FLOW.indexOf(dispatch.status as DispatchStatus);
              const done = idx >= i && idx !== -1;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium',
                      done ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {DISPATCH_STATUS_META[s].label}
                  </span>
                  {i < DISPATCH_FLOW.length - 1 && <span className="text-muted-foreground">›</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-xl p-6 space-y-4 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Shipment Identity</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Row label="Team" value={dispatch.team} />
              <Row label="PI / Order No." value={dispatch.poNumber} />
              <Row label="Vendor" value={dispatch.vendor} />
              <Row label="Mode" value={dispatch.mode} />
              <Row label="Type" value={dispatch.type} />
              <Row label="Incoterm" value={dispatch.incoterm} />
              <Row label="Pick & Drop" value={dispatch.pickDrop} />
              <Row label="POL" value={dispatch.originPort} />
              <Row label="POD" value={dispatch.destinationPort} />
              <Row
                label="Containers"
                value={dispatch.containers?.map((c) => `${c.qty} × ${c.size}`).join(', ')}
              />
              <Row label="Weight" value={dispatch.weight ? `${dispatch.weight} ${dispatch.weightUnit}` : ''} />
              <Row label="Execution Month" value={dispatch.executionMonth} />
            </div>

            <Separator />
            <h3 className="text-sm font-semibold uppercase tracking-wide">Execution Details</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Row label="MBL / MAWB" value={cf.mbl} />
              <Row label="HBL / HAWB" value={cf.hbl} />
              <Row label="Container No." value={cf.containerNumber} />
              <Row label="Vessel" value={cf.vesselName} />
              <Row label="ETD" value={cf.etd} />
              <Row label="ETA" value={cf.eta} />
            </div>

            {(dispatch.requiredCharges?.length ?? 0) > 0 && (
              <>
                <Separator />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Required Charges</h3>
                <div className="flex flex-wrap gap-2">
                  {dispatch.requiredCharges!.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quotes panel — supports split shipments across multiple vendors */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide">Quotes</h3>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setAddOpen(true)}>
                <Plus className="h-3 w-3" />
                Add vendors
              </Button>
            </div>
            {(dispatch.quotes?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                No quotes attached yet. Add the confirmed vendor quotes that make up this dispatch.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {dispatch.quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{q.vendor}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.allocatedQuantity} unit(s) · {q.rate.toLocaleString()} {q.currency}
                        {q.transitDays ? ` · ${q.transitDays}d` : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeQuoteFromDispatch(dispatch.id, q.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Separator />
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Notes</Label>
              <Input
                className="mt-2"
                defaultValue={dispatch.additionalNotes}
                onBlur={(e) => updateDispatch(dispatch.id, { additionalNotes: e.target.value })}
                placeholder="Operational notes"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <Truck className="h-4 w-4 shrink-0" />
              Dispatch status is tracked independently of the originating RFQ status.
            </div>
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attach a confirmed vendor quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vendor</Label>
              <Input className="mt-2" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rate</Label>
                <Input className="mt-2" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
              <div>
                <Label>Allocated Qty</Label>
                <Input className="mt-2" value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!vendor.trim()) return toast.error('Vendor is required');
                addQuoteToDispatch(dispatch.id, {
                  vendor: vendor.trim(),
                  rate: parseFloat(rate) || 0,
                  currency: dispatch.cargoCurrency || 'USD',
                  allocatedQuantity: parseInt(qty) || 1,
                });
                setVendor('');
                setRate('');
                setQty('1');
                setAddOpen(false);
                toast.success('Quote attached to dispatch');
              }}
            >
              Add quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
