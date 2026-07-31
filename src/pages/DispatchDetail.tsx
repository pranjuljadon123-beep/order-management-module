import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useDispatches, type Dispatch as DispatchRecord } from '@/hooks/useTeamsUsers';
import { DISPATCH_FLOW, DISPATCH_STATUS_META, type DispatchStatus } from '@/lib/rfqWorkflow';
import {
  ArrowLeft,
  Plus,
  Radar,
  Trash2,
  Copy,
  Archive,
  Pencil,
  Ship,
  MapPin,
  FileDown,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/** One label/value line in the left information rail. */
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border/60 py-3 last:border-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium">{value || '--'}</span>
    </div>
  );
}

export default function DispatchDetail() {
  const { dispatchId = '' } = useParams();
  const navigate = useNavigate();
  const {
    dispatches,
    setDispatchStatus,
    addQuoteToDispatch,
    removeQuoteFromDispatch,
    updateDispatch,
  } = useDispatches();

  const dispatch = useMemo(
    () => dispatches.find((d) => d.id === dispatchId || d.dispatchNumber === dispatchId),
    [dispatches, dispatchId]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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

  const d: DispatchRecord = dispatch;
  const meta = DISPATCH_STATUS_META[d.status as DispatchStatus] ?? DISPATCH_STATUS_META.NEW_DISPATCH;
  const cf = d.customFields || {};
  const packaging = d.containers?.map((c) => `${c.qty} x ${c.size}`).join(', ');
  const created = new Date(d.createdAt);
  const isTracking = d.status !== 'NEW_DISPATCH' && d.status !== 'CANCELLED';

  const goToTrack = () => {
    const params = new URLSearchParams({
      gid: d.gid,
      dispatch: d.dispatchNumber,
      vendor: d.vendor,
      pol: d.originPort,
      pod: d.destinationPort,
      mode: d.mode,
      ...(cf.mbl ? { bl: cf.mbl } : {}),
      ...(cf.containerNumber ? { container: cf.containerNumber } : {}),
      ...(cf.eta ? { eta: cf.eta } : {}),
      ...(cf.etd ? { etd: cf.etd } : {}),
      ...(cf.vesselName ? { vessel: cf.vesselName } : {}),
    });
    navigate(`/tracking?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* ── Dispatch header ────────────────────────────────── */}
        <div className="glass-card rounded-xl px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <div className="flex min-w-0 items-start gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 mt-0.5 h-8 w-8"
                onClick={() => navigate('/procurement')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight">{d.dispatchNumber}</h1>
                <Badge className={cn('mt-1 uppercase', meta.className)}>{meta.label}</Badge>
              </div>
            </div>

            <div className="min-w-0 space-y-1 text-sm">
              <p className="text-muted-foreground">
                Created Date: <span className="text-foreground">{created.toLocaleString()}</span>
              </p>
              <p className="text-muted-foreground">
                Created By: <span className="text-foreground">{d.team || 'Daistrix User'}</span>
              </p>
            </div>

            <div className="min-w-0 space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{d.originPort || '--'}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium">{d.destinationPort || '--'}</span>
              </p>
            </div>

            <div className="flex min-w-0 items-start gap-2 text-sm">
              <Ship className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate font-semibold uppercase">
                  {[d.mode, d.incoterm && `(${d.incoterm})`, d.type].filter(Boolean).join(' ')}
                </p>
                <p className="truncate text-muted-foreground">GID: {d.gid}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                title="Copy GID"
                onClick={() => {
                  navigator.clipboard?.writeText(d.gid);
                  toast.success('GID copied to clipboard');
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive"
                title="Cancel dispatch"
                onClick={() => {
                  setDispatchStatus(d.id, 'CANCELLED' as DispatchStatus);
                  toast.success('Dispatch cancelled');
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                title="Archive dispatch"
                onClick={() => toast.success(`${d.dispatchNumber} archived`)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Section bar ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-0">
          <div className="border-b-2 border-primary px-1 pb-3 text-sm font-semibold text-primary">
            Dispatch Details &amp; Docs
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-3">
            <Select
              value={d.status}
              onValueChange={(v) => {
                setDispatchStatus(d.id, v as DispatchStatus);
                toast.success(`Dispatch moved to ${DISPATCH_STATUS_META[v as DispatchStatus].label}`);
              }}
            >
              <SelectTrigger className="h-9 w-48">
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
            <Button variant="outline" className="h-9 gap-2" onClick={goToTrack}>
              {isTracking ? (
                <Radar className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isTracking ? 'Track in DxTrack' : 'Generating shipment…'}
            </Button>
            <Button className="h-9 gap-2" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
          {/* Left rail */}
          <div className="glass-card rounded-xl">
            <Tabs defaultValue="info">
              <TabsList className="w-full justify-start rounded-t-xl rounded-b-none border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="info"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  Dispatch Information
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  Activity Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-0 px-5 py-1">
                <InfoRow label="Type" value={d.type} />
                <InfoRow label="Mode" value={d.mode} />
                <InfoRow label="Service" value={d.pickDrop} />
                <InfoRow label="Incoterm" value={d.incoterm} />
                <InfoRow label="Charges Req." value={d.requiredCharges?.join(', ')} />
                <InfoRow label="Shipper" value={d.shipper} />
                <InfoRow label="Consignee" value={d.consignee} />
                <InfoRow label="Customer" value={d.customer} />
                <InfoRow label="Packaging" value={packaging} />
                <InfoRow label="Packaging Details" value={d.packageType} />
                <InfoRow label="Net weight" value={d.weight ? `${d.weight} ${d.weightUnit}` : 'N/A'} />
                <InfoRow
                  label="Gross weight"
                  value={d.weight ? `${d.weight} ${d.weightUnit}` : 'N/A'}
                />
                <InfoRow label="Volume" value={d.volume ? `${d.volume} ${d.volumeUnit}` : 'N/A'} />
                <InfoRow label="Shipment Execution Month" value={d.executionMonth} />
                <InfoRow label="POL" value={d.originPort} />
                <InfoRow label="POD" value={d.destinationPort} />
                <InfoRow label="PI / Order No." value={d.poNumber} />
                <InfoRow label="Team" value={d.team} />
                <InfoRow label="MBL / MAWB" value={cf.mbl} />
                <InfoRow label="HBL / HAWB" value={cf.hbl} />
                <InfoRow label="Container No." value={cf.containerNumber} />
                <InfoRow label="Vessel" value={cf.vesselName} />
                <InfoRow label="ETD" value={cf.etd} />
                <InfoRow label="ETA" value={cf.eta} />
                <InfoRow
                  label="Cargo Value"
                  value={d.cargoValue ? `${d.cargoValue.toLocaleString()} ${d.cargoCurrency}` : ''}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-0 px-5 py-4">
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Dispatch created</p>
                      <p className="text-xs text-muted-foreground">
                        {created.toLocaleString()}
                        {d.rfqNumber ? ` · inherited from ${d.rfqNumber}` : ''}
                      </p>
                    </div>
                  </li>
                  {d.quotes.map((q) => (
                    <li key={q.id} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Quote confirmed — {q.vendor}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.allocatedQuantity} unit(s) · {q.rate.toLocaleString()} {q.currency} ·{' '}
                          {new Date(q.confirmedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Status: {meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(d.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                </ol>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quotes table */}
          <div className="glass-card min-w-0 rounded-xl">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <h3 className="text-sm font-semibold">Quotes</h3>
              <Button size="sm" className="gap-1" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add vendors
              </Button>
            </div>
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">GID</th>
                    <th className="px-4 py-3 text-left font-semibold">Ref Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Services</th>
                    <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                    <th className="px-4 py-3 text-left font-semibold">Enquiry GID</th>
                    <th className="px-4 py-3 text-left font-semibold">Shipping Line</th>
                    <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {d.quotes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                        No quotes attached yet. Add the confirmed vendor quotes that make up this dispatch.
                      </td>
                    </tr>
                  ) : (
                    d.quotes.map((q) => (
                      <tr key={q.id} className="border-b border-border/60 last:border-0">
                        <td className="max-w-[140px] truncate px-4 py-3 font-medium">
                          {q.quoteId || `${d.gid}-${q.id.slice(-4).toUpperCase()}`}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{d.poNumber || '--'}</td>
                        <td className="max-w-[150px] truncate px-4 py-3">{d.pickDrop || 'Freight Forwarding'}</td>
                        <td className="max-w-[150px] truncate px-4 py-3">{q.vendor}</td>
                        <td className="px-4 py-3">
                          <button
                            className="truncate text-primary hover:underline"
                            onClick={() => d.rfqId ? navigate(`/procurement/${d.rfqId}`) : toast.info('No linked enquiry')}
                          >
                            {d.rfqNumber || '--'}
                          </button>
                        </td>
                        <td className="max-w-[150px] truncate px-4 py-3">{cf.vesselName || q.vendor}</td>
                        <td className="max-w-[150px] truncate px-4 py-3">
                          {q.allocatedQuantity} {packaging ? `x ${d.containers?.[0]?.size ?? ''}` : 'unit(s)'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold">
                          {q.rate.toLocaleString()} {q.currency}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="h-8"
                              onClick={() => toast.info(`Opening quote from ${q.vendor}`)}
                            >
                              View/Edit Quote
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              title="Mark confirmed"
                              onClick={() => toast.success(`${q.vendor} quote reconfirmed`)}
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              title="Download quote"
                              onClick={() => toast.success('Quote PDF queued for download')}
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="Remove quote"
                              onClick={() => {
                                removeQuoteFromDispatch(d.id, q.id);
                                toast.success('Quote removed from dispatch');
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border px-5 py-4">
              <Label className="text-xs uppercase text-muted-foreground">Operational notes</Label>
              <Input
                className="mt-2"
                defaultValue={d.additionalNotes}
                onBlur={(e) => updateDispatch(d.id, { additionalNotes: e.target.value })}
                placeholder="Add handover notes for operations"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add vendor quote */}
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
          <DialogFooter className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                if (!vendor.trim()) return toast.error('Vendor is required');
                addQuoteToDispatch(d.id, {
                  vendor: vendor.trim(),
                  rate: parseFloat(rate) || 0,
                  currency: d.cargoCurrency || 'USD',
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

      {/* Edit execution details */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit execution details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['mbl', 'MBL / MAWB'],
                ['hbl', 'HBL / HAWB'],
                ['containerNumber', 'Container No.'],
                ['vesselName', 'Vessel'],
                ['etd', 'ETD'],
                ['eta', 'ETA'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  className="mt-2"
                  defaultValue={cf[key] || ''}
                  onBlur={(e) =>
                    updateDispatch(d.id, { customFields: { ...cf, [key]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setEditOpen(false);
                toast.success('Dispatch updated');
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
