import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, AlertCircle, Ship, Plane, Truck, Train, Warehouse, Package as PackageIcon, Upload } from 'lucide-react';
import { useDispatches } from '@/hooks/useTeamsUsers';
import { useShippers, useConsignees, useCustomers } from '@/hooks/useEntities';
import { toast } from 'sonner';

interface CreateDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: Partial<DispatchForm> & { vendor?: string; rfqId?: string; quoteId?: string; laneId?: string };
}

interface DispatchForm {
  team: string;
  poNumber: string;
  vendor: string;
  customs: string;
  shipper: string;
  consignee: string;
  customer: string;
  mode: string;
  cargoType: string;
  containers: { size: string; qty: number }[];
  weight: string;
  weightUnit: string;
  volume: string;
  volumeUnit: string;
  packageType: string;
  type: string;
  incoterm: string;
  pickDrop: string;
  originPort: string;
  destinationPort: string;
  originAddress: string;
  destinationAddress: string;
  stuffingLocation: string;
  destuffingLocation: string;
  products: { hsCode: string; name: string; items: string }[];
  cargoValue: string;
  cargoCurrency: string;
  additionalNotes: string;
  executionMonth: string;
  mbl: string;
  hbl: string;
  eta: string;
  etd: string;
  containerNumber: string;
  vesselName: string;
  rfqId?: string;
  quoteId?: string;
  laneId?: string;
}

const empty: DispatchForm = {
  team: 'Demo USD',
  poNumber: '',
  vendor: '',
  customs: '',
  shipper: '',
  consignee: '',
  customer: '',
  mode: 'FCL',
  cargoType: 'General Cargo',
  containers: [{ size: '20ft', qty: 1 }],
  weight: '',
  weightUnit: 'KG',
  volume: '',
  volumeUnit: 'CBM',
  packageType: 'Stackable',
  type: 'Export',
  incoterm: 'CIF',
  pickDrop: 'PORT (ORIGIN) TO PORT (DESTINATION)',
  originPort: '',
  destinationPort: '',
  originAddress: '',
  destinationAddress: '',
  stuffingLocation: '',
  destuffingLocation: '',
  products: [],
  cargoValue: '',
  cargoCurrency: 'INR',
  additionalNotes: '',
  executionMonth: '',
  mbl: '',
  hbl: '',
  eta: '',
  etd: '',
  containerNumber: '',
  vesselName: '',
};

const modes = [
  { key: 'FCL', icon: Ship },
  { key: 'LCL', icon: PackageIcon },
  { key: 'AIR', icon: Plane },
  { key: 'FTL', icon: Truck },
  { key: 'LTL', icon: Truck },
  { key: 'Rail FCL', icon: Train },
  { key: 'Rail LCL', icon: Train },
  { key: 'Warehouse', icon: Warehouse },
];

const steps = [
  { key: 'reference',   label: 'Reference',    required: true },
  { key: 'consignment', label: 'Consignment',  required: false },
  { key: 'mode',        label: 'Mode',         required: true },
  { key: 'weight',      label: 'Weight & Volume', required: false },
  { key: 'address',     label: 'Address & Service', required: true },
  { key: 'product',     label: 'Product',      required: false },
  { key: 'other',       label: 'Other Details', required: false },
  { key: 'custom',      label: 'Custom Fields', required: false },
] as const;

export function CreateDispatchDialog({ open, onOpenChange, prefill }: CreateDispatchDialogProps) {
  const [form, setForm] = useState<DispatchForm>({ ...empty, ...prefill });
  const [active, setActive] = useState<string>('reference');
  const { addDispatch } = useDispatches();
  const { data: shippers = [] } = useShippers();
  const { data: consignees = [] } = useConsignees();
  const { data: customers = [] } = useCustomers();

  const patch = (p: Partial<DispatchForm>) => setForm(f => ({ ...f, ...p }));

  const stepStatus = useMemo(() => ({
    reference:   form.poNumber && form.vendor ? 'done' : 'pending',
    consignment: form.shipper || form.consignee || form.customer ? 'done' : 'optional',
    mode:        form.mode ? 'done' : 'pending',
    weight:      form.weight ? 'done' : 'optional',
    address:     form.originPort && form.destinationPort ? 'done' : 'pending',
    product:     form.products.length > 0 ? 'done' : 'optional',
    other:       form.additionalNotes || form.executionMonth ? 'done' : 'optional',
    custom:      form.mbl || form.hbl || form.containerNumber ? 'done' : 'warn',
  }), [form]);

  const canSubmit = form.poNumber && form.vendor && form.mode && form.originPort && form.destinationPort;

  const submit = () => {
    if (!canSubmit) {
      toast.error('Please complete the required fields');
      return;
    }
    const d = addDispatch({
      rfqId: form.rfqId,
      quoteId: form.quoteId,
      laneId: form.laneId,
      vendor: form.vendor,
      mode: form.mode,
      type: form.type,
      incoterm: form.incoterm,
      originPort: form.originPort,
      destinationPort: form.destinationPort,
      containers: form.containers,
      weight: parseFloat(form.weight) || 0,
      weightUnit: form.weightUnit,
      volume: parseFloat(form.volume) || 0,
      volumeUnit: form.volumeUnit,
      packageType: form.packageType,
      shipper: form.shipper,
      consignee: form.consignee,
      customer: form.customer,
      poNumber: form.poNumber,
      cargoValue: parseFloat(form.cargoValue) || 0,
      cargoCurrency: form.cargoCurrency,
      executionMonth: form.executionMonth,
      additionalNotes: form.additionalNotes,
      customFields: {
        mbl: form.mbl,
        hbl: form.hbl,
        eta: form.eta,
        etd: form.etd,
        containerNumber: form.containerNumber,
        vesselName: form.vesselName,
      },
    });
    toast.success(`Dispatch ${d.dispatchNumber} created`, {
      description: `${form.originPort} → ${form.destinationPort} via ${form.vendor}`,
    });
    onOpenChange(false);
    setForm({ ...empty });
    setActive('reference');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">NEW DISPATCH</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Left steps */}
          <aside className="w-64 shrink-0 border-r bg-muted/30 overflow-y-auto py-4">
            {steps.map(s => {
              const st = stepStatus[s.key];
              const Icon = st === 'done' ? CheckCircle2 : st === 'warn' ? AlertCircle : Circle;
              const color = st === 'done' ? 'text-success' : st === 'warn' ? 'text-warning' : 'text-muted-foreground';
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-6 py-3 text-sm text-left transition-colors hover:bg-muted',
                    active === s.key && 'bg-background border-l-2 border-accent font-medium'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', color)} />
                  <span>
                    {s.label}
                    {!s.required && <span className="text-muted-foreground text-xs"> (optional)</span>}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Right form */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {active === 'reference' && (
              <section className="space-y-6">
                <div>
                  <Label>Select Team *</Label>
                  <Select value={form.team} onValueChange={v => patch({ team: v })}>
                    <SelectTrigger className="mt-2 max-w-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Demo USD">Demo USD</SelectItem>
                      <SelectItem value="Demo INR">Demo INR</SelectItem>
                      <SelectItem value="Daistrix US">Daistrix US</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <h3 className="text-sm font-semibold tracking-wider">REFERENCE</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label>PI No., Order No. *</Label>
                    <Input className="mt-2" value={form.poNumber} onChange={e => patch({ poNumber: e.target.value })} placeholder="e.g. PO-2026-0042" />
                  </div>
                  <div>
                    <Label>Select Vendor *</Label>
                    <Input className="mt-2" value={form.vendor} onChange={e => patch({ vendor: e.target.value })} placeholder="Carrier / forwarder" />
                  </div>
                  <div>
                    <Label>Select Customs</Label>
                    <Input className="mt-2" value={form.customs} onChange={e => patch({ customs: e.target.value })} placeholder="Customs broker" />
                  </div>
                </div>
              </section>
            )}

            {active === 'consignment' && (
              <section className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider">CONSIGNMENT DETAILS</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label>Shipper</Label>
                    <Select value={form.shipper || 'none'} onValueChange={v => patch({ shipper: v === 'none' ? '' : v })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select or type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {shippers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Consignee</Label>
                    <Select value={form.consignee || 'none'} onValueChange={v => patch({ consignee: v === 'none' ? '' : v })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select or type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {consignees.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Customer</Label>
                    <Select value={form.customer || 'none'} onValueChange={v => patch({ customer: v === 'none' ? '' : v })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select or type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            )}

            {active === 'mode' && (
              <section className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider">MODE</h3>
                <div className="flex flex-wrap gap-3">
                  {modes.map(m => {
                    const active = form.mode === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => patch({ mode: m.key })}
                        className={cn(
                          'flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-lg border w-24 transition-colors',
                          active ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:bg-muted'
                        )}
                      >
                        <m.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{m.key}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.cargoType} onValueChange={v => patch({ cargoType: v })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Cargo">General Cargo</SelectItem>
                        <SelectItem value="Hazardous">Hazardous</SelectItem>
                        <SelectItem value="Reefer">Reefer</SelectItem>
                        <SelectItem value="Out of Gauge">Out of Gauge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Add Containers</Label>
                  {form.containers.map((c, i) => (
                    <div key={i} className="flex gap-3 max-w-md">
                      <Input
                        type="number"
                        value={c.qty}
                        onChange={e => {
                          const next = [...form.containers];
                          next[i] = { ...c, qty: parseInt(e.target.value) || 0 };
                          patch({ containers: next });
                        }}
                        placeholder="Qty"
                      />
                      <Select value={c.size} onValueChange={v => {
                        const next = [...form.containers];
                        next[i] = { ...c, size: v };
                        patch({ containers: next });
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20ft">20ft</SelectItem>
                          <SelectItem value="40ft">40ft</SelectItem>
                          <SelectItem value="40ft HC">40ft HC</SelectItem>
                          <SelectItem value="45ft">45ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => patch({ containers: [...form.containers, { size: '20ft', qty: 1 }] })}>
                    + Add Container
                  </Button>
                </div>
              </section>
            )}

            {active === 'weight' && (
              <section className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider">WEIGHT & VOLUME</h3>
                <div className="grid grid-cols-3 gap-6 max-w-3xl">
                  <div>
                    <Label>Weight per {form.containers[0]?.size || '20ft'}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={form.weight} onChange={e => patch({ weight: e.target.value })} placeholder="25000" />
                      <Select value={form.weightUnit} onValueChange={v => patch({ weightUnit: v })}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="LB">LB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Volume per {form.containers[0]?.size || '20ft'}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={form.volume} onChange={e => patch({ volume: e.target.value })} placeholder="0" />
                      <Select value={form.volumeUnit} onValueChange={v => patch({ volumeUnit: v })}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CBM">CBM</SelectItem>
                          <SelectItem value="CFT">CFT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Package Type *</Label>
                    <Select value={form.packageType} onValueChange={v => patch({ packageType: v })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stackable">Stackable</SelectItem>
                        <SelectItem value="Non-Stackable">Non-Stackable</SelectItem>
                        <SelectItem value="Palletized">Palletized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            )}

            {active === 'address' && (
              <section className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider">ADDRESS & SERVICES</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.type} onValueChange={v => patch({ type: v })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Export">Export</SelectItem>
                        <SelectItem value="Import">Import</SelectItem>
                        <SelectItem value="Domestic">Domestic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Incoterm *</Label>
                    <Select value={form.incoterm} onValueChange={v => patch({ incoterm: v })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pick &amp; Drop *</Label>
                    <Select value={form.pickDrop} onValueChange={v => patch({ pickDrop: v })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PORT (ORIGIN) TO PORT (DESTINATION)">Port → Port</SelectItem>
                        <SelectItem value="DOOR TO PORT">Door → Port</SelectItem>
                        <SelectItem value="PORT TO DOOR">Port → Door</SelectItem>
                        <SelectItem value="DOOR TO DOOR">Door → Door</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label>Origin Port *</Label>
                    <Input className="mt-2" value={form.originPort} onChange={e => patch({ originPort: e.target.value })} placeholder="JNPT (Nhava Sheva), Mumbai, India" />
                  </div>
                  <div>
                    <Label>Origin Address</Label>
                    <Input className="mt-2" value={form.originAddress} onChange={e => patch({ originAddress: e.target.value })} placeholder="Please update origin address" />
                  </div>
                  <div>
                    <Label>Stuffing Location</Label>
                    <Input className="mt-2" value={form.stuffingLocation} onChange={e => patch({ stuffingLocation: e.target.value })} placeholder="Please select location" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label>Destination Port *</Label>
                    <Input className="mt-2" value={form.destinationPort} onChange={e => patch({ destinationPort: e.target.value })} placeholder="Djibouti, DJJIB" />
                  </div>
                  <div>
                    <Label>Destination Address</Label>
                    <Input className="mt-2" value={form.destinationAddress} onChange={e => patch({ destinationAddress: e.target.value })} placeholder="Please update destination address" />
                  </div>
                  <div>
                    <Label>De-stuffing Location</Label>
                    <Input className="mt-2" value={form.destuffingLocation} onChange={e => patch({ destuffingLocation: e.target.value })} placeholder="Please select location" />
                  </div>
                </div>
              </section>
            )}

            {active === 'product' && (
              <section className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-xs font-semibold uppercase text-muted-foreground pb-2 border-b">
                  <div>HS Code</div>
                  <div>Product</div>
                  <div>Number of Items</div>
                  <div>Cargo Invoice Value</div>
                </div>
                {form.products.map((p, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4">
                    <Input value={p.hsCode} onChange={e => { const n = [...form.products]; n[i] = { ...p, hsCode: e.target.value }; patch({ products: n }); }} />
                    <Input value={p.name} onChange={e => { const n = [...form.products]; n[i] = { ...p, name: e.target.value }; patch({ products: n }); }} />
                    <Input value={p.items} onChange={e => { const n = [...form.products]; n[i] = { ...p, items: e.target.value }; patch({ products: n }); }} />
                    <div />
                  </div>
                ))}
                <Button variant="ghost" className="text-accent" onClick={() => patch({ products: [...form.products, { hsCode: '', name: '', items: '' }] })}>
                  + ADD PRODUCT
                </Button>
                <div className="max-w-sm ml-auto flex gap-2">
                  <Input value={form.cargoValue} onChange={e => patch({ cargoValue: e.target.value })} placeholder="0.0" />
                  <Select value={form.cargoCurrency} onValueChange={v => patch({ cargoCurrency: v })}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>
            )}

            {active === 'other' && (
              <section className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider">OTHER DETAILS</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <Label>Additional Information / Comments</Label>
                    <Textarea className="mt-2 min-h-[120px]" value={form.additionalNotes} onChange={e => patch({ additionalNotes: e.target.value })} placeholder="Mention additional requirements" />
                  </div>
                  <div>
                    <Label>Upload Files</Label>
                    <button type="button" onClick={() => toast.info('File upload will be enabled with storage bucket')} className="mt-2 w-full border-2 border-dashed rounded-lg py-8 flex flex-col items-center justify-center gap-2 text-accent hover:bg-accent/5">
                      <Upload className="h-5 w-5" />
                      <span className="text-sm font-medium">Select Files</span>
                    </button>
                  </div>
                </div>
                <div className="max-w-xs">
                  <Label>Shipment Execution Month</Label>
                  <Input type="month" className="mt-2" value={form.executionMonth} onChange={e => patch({ executionMonth: e.target.value })} />
                </div>
              </section>
            )}

            {active === 'custom' && (
              <section className="space-y-6">
                <h3 className="text-sm font-semibold tracking-wider">CUSTOM FIELDS</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div><Label>MBL / MAWB</Label><Input className="mt-2" value={form.mbl} onChange={e => patch({ mbl: e.target.value })} /></div>
                  <div><Label>HBL / HAWB</Label><Input className="mt-2" value={form.hbl} onChange={e => patch({ hbl: e.target.value })} /></div>
                  <div><Label>ETA (DD/MM/YYYY HH:MM)</Label><Input type="datetime-local" className="mt-2" value={form.eta} onChange={e => patch({ eta: e.target.value })} /></div>
                  <div><Label>ETD (DD/MM/YYYY HH:MM)</Label><Input type="datetime-local" className="mt-2" value={form.etd} onChange={e => patch({ etd: e.target.value })} /></div>
                  <div><Label>Container Number</Label><Input className="mt-2" value={form.containerNumber} onChange={e => patch({ containerNumber: e.target.value })} /></div>
                  <div><Label>Vessel Name</Label><Input className="mt-2" value={form.vesselName} onChange={e => patch({ vesselName: e.target.value })} /></div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer summary */}
        <div className="border-t bg-muted/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-8 text-sm">
            <div><span className="text-muted-foreground">Route:</span> <span className="font-medium">{form.originPort ? form.originPort.split(',')[0] : '—'} → {form.destinationPort ? form.destinationPort.split(',')[0] : '—'}</span></div>
            <div><span className="text-muted-foreground">Containers:</span> <span className="font-medium">{form.containers.reduce((a, c) => a + c.qty, 0)} × {form.containers[0]?.size || '—'}</span></div>
            <div><span className="text-muted-foreground">Mode:</span> <span className="font-medium">{form.mode}</span></div>
            <div><span className="text-muted-foreground">Wt:</span> <span className="font-medium">{form.weight || 0} {form.weightUnit}</span></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!canSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Create Dispatch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}