import { useState } from 'react';
import { useForm, useFieldArray, useWatch, UseFormReturn } from 'react-hook-form';
import { useCreateRfq, useCarriers } from '@/hooks/useProcurement';
import { useShippers, useConsignees, getEntityAddress, getEntityPort } from '@/hooks/useEntities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Plus, Trash2, Loader2, Ship, Plane, Truck, Train, 
  FileText, ScrollText, ChevronLeft, ChevronRight, 
  Gavel, Settings2, MapPin
} from 'lucide-react';
import type { CreateRfqInput, TransportMode } from '@/types/procurement';
import { ConsignmentDetailsSection } from './ConsignmentDetailsSection';
import { LaneDimensionsSection } from './LaneDimensionsSection';

interface CreateRfqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RfqType = 'spot' | 'contract';
type AuctionStructure = 'single_round' | 'multi_round';
type RankingLogic = 'price_only' | 'weighted_score';

const transportModes: { value: TransportMode; label: string; icon: typeof Ship }[] = [
  { value: 'ocean_fcl', label: 'Ocean FCL', icon: Ship },
  { value: 'ocean_lcl', label: 'Ocean LCL', icon: Ship },
  { value: 'air', label: 'Air Freight', icon: Plane },
  { value: 'road_ftl', label: 'Road FTL', icon: Truck },
  { value: 'road_ltl', label: 'Road LTL', icon: Truck },
  { value: 'rail', label: 'Rail', icon: Train },
];

const incoterms = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

interface ExtendedLaneInput {
  origin_city: string;
  origin_country: string;
  origin_port?: string;
  origin_address?: string;
  destination_city: string;
  destination_country: string;
  destination_port?: string;
  destination_address?: string;
  equipment_type?: string;
  estimated_volume?: string;
  volume_unit?: string;
  frequency?: string;
  shipper_id?: string;
  consignee_id?: string;
  weight_value?: number;
  weight_unit?: string;
  volume_cbm?: number;
  quantity?: number;
  package_type?: string;
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  dimensions_unit?: string;
}

interface ExtendedRfqInput extends Omit<CreateRfqInput, 'lanes'> {
  lanes: ExtendedLaneInput[];
  po_number?: string;
  so_number?: string;
  customer_id?: string;
  shipper_id?: string;
  consignee_id?: string;
  cargo_type?: string;
  cargo_description?: string;
  pickup_date?: string;
  weight_value?: number;
  weight_unit?: string;
  volume_cbm?: number;
  quantity?: number;
}

export function CreateRfqDialog({ open, onOpenChange }: CreateRfqDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rfqType, setRfqType] = useState<RfqType | null>(null);
  const [auctionConfig, setAuctionConfig] = useState({
    structure: 'single_round' as AuctionStructure,
    rankingLogic: 'price_only' as RankingLogic,
    priceWeight: 70,
    transitTimeWeight: 30,
    minBidDecrement: '',
    autoExtend: false,
    autoExtendMinutes: 5,
  });
  
  const { data: shippers = [] } = useShippers();
  const { data: consignees = [] } = useConsignees();
  
  const createRfq = useCreateRfq();
  
  const form = useForm<ExtendedRfqInput>({
    defaultValues: {
      title: '',
      mode: 'ocean_fcl',
      incoterms: 'FOB',
      contract_duration_months: 12,
      estimated_annual_volume: '',
      bid_deadline: '',
      notes: '',
      po_number: '',
      so_number: '',
      customer_id: '',
      shipper_id: '',
      consignee_id: '',
      cargo_type: '',
      cargo_description: '',
      pickup_date: '',
      weight_value: undefined,
      weight_unit: 'KG',
      volume_cbm: undefined,
      quantity: undefined,
      lanes: [
        {
          origin_city: '',
          origin_country: '',
          origin_port: '',
          origin_address: '',
          destination_city: '',
          destination_country: '',
          destination_port: '',
          destination_address: '',
          equipment_type: '',
          estimated_volume: '',
          volume_unit: 'TEU',
          shipper_id: '',
          consignee_id: '',
          weight_value: undefined,
          weight_unit: 'KG',
          volume_cbm: undefined,
          quantity: undefined,
          dimensions_unit: 'CM',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lanes',
  });

  // Watch for shipper/consignee changes at RFQ level to auto-populate lane addresses
  const rfqShipperId = useWatch({ control: form.control, name: 'shipper_id' });
  const rfqConsigneeId = useWatch({ control: form.control, name: 'consignee_id' });

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setRfqType(null);
      form.reset();
    }, 200);
  };

  const onSubmit = async (data: ExtendedRfqInput) => {
    // Map extended input to API format
    const submitData: any = {
      title: data.title,
      mode: data.mode,
      incoterms: data.incoterms,
      contract_duration_months: data.contract_duration_months,
      estimated_annual_volume: data.estimated_annual_volume,
      bid_deadline: data.bid_deadline,
      notes: data.notes,
      rfq_type: rfqType || 'spot',
      po_number: data.po_number,
      so_number: data.so_number,
      customer_id: data.customer_id || null,
      shipper_id: data.shipper_id || null,
      consignee_id: data.consignee_id || null,
      cargo_type: data.cargo_type,
      cargo_description: data.cargo_description,
      pickup_date: data.pickup_date || null,
      lanes: data.lanes.map(lane => ({
        ...lane,
        shipper_id: lane.shipper_id || data.shipper_id || null,
        consignee_id: lane.consignee_id || data.consignee_id || null,
      })),
    };
    
    await createRfq.mutateAsync(submitData);
    handleClose();
  };

  const addLane = () => {
    const selectedShipper = shippers.find(s => s.id === rfqShipperId);
    const selectedConsignee = consignees.find(c => c.id === rfqConsigneeId);
    
    append({
      origin_city: selectedShipper?.city || '',
      origin_country: selectedShipper?.country || '',
      origin_port: getEntityPort(selectedShipper || null),
      origin_address: getEntityAddress(selectedShipper || null),
      destination_city: selectedConsignee?.city || '',
      destination_country: selectedConsignee?.country || '',
      destination_port: getEntityPort(selectedConsignee || null),
      destination_address: getEntityAddress(selectedConsignee || null),
      equipment_type: '',
      estimated_volume: '',
      volume_unit: 'TEU',
      shipper_id: rfqShipperId,
      consignee_id: rfqConsigneeId,
      weight_value: undefined,
      weight_unit: 'KG',
      volume_cbm: undefined,
      quantity: undefined,
      dimensions_unit: 'CM',
    });
  };

  const handleTypeSelect = (type: RfqType) => {
    setRfqType(type);
    setStep(2);
  };

  const isSpot = rfqType === 'spot';

  const renderStep1 = () => (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Select RFQ Type</h3>
        <p className="text-sm text-muted-foreground">
          Choose the type of freight procurement you need
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleTypeSelect('spot')}
          className="group relative flex flex-col items-center gap-4 rounded-xl border-2 border-border/50 bg-muted/30 p-6 text-left transition-all hover:border-accent hover:bg-accent/5"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            <FileText className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-foreground">Spot RFQ</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Single shipment or short-term requirement
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect('contract')}
          className="group relative flex flex-col items-center gap-4 rounded-xl border-2 border-border/50 bg-muted/30 p-6 text-left transition-all hover:border-accent hover:bg-accent/5"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ScrollText className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-foreground">Contract RFQ</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Multi-lane, long-term freight agreement
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">
          {rfqType === 'spot' ? 'Spot' : 'Contract'} RFQ
        </span>
        <span>→ RFQ Details</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>RFQ Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Q1 2025 Asia-Pacific Ocean Freight" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transport Mode</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {transportModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div className="flex items-center gap-2">
                        <mode.icon className="h-4 w-4" />
                        {mode.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="incoterms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incoterms</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incoterms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {incoterms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {rfqType === 'contract' && (
          <FormField
            control={form.control}
            name="contract_duration_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Duration (months)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="bid_deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bid Deadline</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimated_annual_volume"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Estimated {rfqType === 'spot' ? 'Volume' : 'Annual Volume'}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 500 TEUs, 10,000 kg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Consignment Details Section */}
      <ConsignmentDetailsSection form={form} rfqType={rfqType} />

      <Separator />

      {/* Lanes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Lanes</h3>
            <p className="text-sm text-muted-foreground">
              Add origin-destination pairs for this RFQ
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLane}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lane
          </Button>
        </div>

        {fields.map((field, index) => (
          <LaneFormSection 
            key={field.id}
            form={form}
            index={index}
            isSpot={isSpot}
            fieldsLength={fields.length}
            onRemove={() => remove(index)}
            shippers={shippers}
            consignees={consignees}
          />
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">
          {rfqType === 'spot' ? 'Spot' : 'Contract'} RFQ
        </span>
        <span>→ Auction Configuration</span>
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/30 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Gavel className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Blind Reverse Auction</h3>
            <p className="text-sm text-muted-foreground">
              Vendors bid competitively without seeing other prices
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Auction Structure</Label>
            <RadioGroup
              value={auctionConfig.structure}
              onValueChange={(v) => setAuctionConfig({ ...auctionConfig, structure: v as AuctionStructure })}
              className="mt-2 grid gap-3 sm:grid-cols-2"
            >
              <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4">
                <RadioGroupItem value="single_round" id="single" />
                <div>
                  <Label htmlFor="single" className="cursor-pointer font-medium">Single Round</Label>
                  <p className="text-xs text-muted-foreground">One-time sealed bids</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4">
                <RadioGroupItem value="multi_round" id="multi" />
                <div>
                  <Label htmlFor="multi" className="cursor-pointer font-medium">Multiple Rounds</Label>
                  <p className="text-xs text-muted-foreground">Iterative bidding with rank updates</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Ranking Logic</Label>
            <RadioGroup
              value={auctionConfig.rankingLogic}
              onValueChange={(v) => setAuctionConfig({ ...auctionConfig, rankingLogic: v as RankingLogic })}
              className="mt-2 grid gap-3 sm:grid-cols-2"
            >
              <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4">
                <RadioGroupItem value="price_only" id="price" />
                <div>
                  <Label htmlFor="price" className="cursor-pointer font-medium">Price Only</Label>
                  <p className="text-xs text-muted-foreground">Lowest price wins</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4">
                <RadioGroupItem value="weighted_score" id="weighted" />
                <div>
                  <Label htmlFor="weighted" className="cursor-pointer font-medium">Weighted Score</Label>
                  <p className="text-xs text-muted-foreground">Price + Transit Time</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {auctionConfig.rankingLogic === 'weighted_score' && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border/50 p-4 bg-background/50">
              <div>
                <Label className="text-sm">Price Weight (%)</Label>
                <Input
                  type="number"
                  value={auctionConfig.priceWeight}
                  onChange={(e) => {
                    const price = parseInt(e.target.value) || 0;
                    setAuctionConfig({ 
                      ...auctionConfig, 
                      priceWeight: price, 
                      transitTimeWeight: 100 - price 
                    });
                  }}
                  min={0}
                  max={100}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Transit Time Weight (%)</Label>
                <Input
                  type="number"
                  value={auctionConfig.transitTimeWeight}
                  readOnly
                  className="mt-1 bg-muted"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm">Min Bid Decrement (optional)</Label>
              <Input
                placeholder="e.g., $50 or 2%"
                value={auctionConfig.minBidDecrement}
                onChange={(e) => setAuctionConfig({ ...auctionConfig, minBidDecrement: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <Label className="font-medium">Auto-Extend on Late Bids</Label>
              <p className="text-xs text-muted-foreground">
                Extend auction if bid received in final minutes
              </p>
            </div>
            <Switch
              checked={auctionConfig.autoExtend}
              onCheckedChange={(v) => setAuctionConfig({ ...auctionConfig, autoExtend: v })}
            />
          </div>

          {auctionConfig.autoExtend && (
            <div>
              <Label className="text-sm">Extension Duration (minutes)</Label>
              <Input
                type="number"
                value={auctionConfig.autoExtendMinutes}
                onChange={(e) => setAuctionConfig({ ...auctionConfig, autoExtendMinutes: parseInt(e.target.value) || 5 })}
                className="mt-1 w-32"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">
          {rfqType === 'spot' ? 'Spot' : 'Contract'} RFQ
        </span>
        <span>→ Review & Create</span>
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Special requirements, terms, or instructions for carriers..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Summary
        </h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">RFQ Type:</span>
            <span className="font-medium capitalize">{rfqType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lanes:</span>
            <span className="font-medium">{fields.length}</span>
          </div>
          {form.watch('po_number') && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">PO Number:</span>
              <span className="font-medium">{form.watch('po_number')}</span>
            </div>
          )}
          {form.watch('pickup_date') && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup Date:</span>
              <span className="font-medium">{form.watch('pickup_date')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Auction:</span>
            <span className="font-medium">
              {auctionConfig.structure === 'single_round' ? 'Single Round' : 'Multi-Round'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ranking:</span>
            <span className="font-medium">
              {auctionConfig.rankingLogic === 'price_only' 
                ? 'Lowest Price' 
                : `Price ${auctionConfig.priceWeight}% / Transit ${auctionConfig.transitTimeWeight}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 1 ? 'Create New Auction RFQ' : `Step ${step} of 4`}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Choose between spot shipment or contract procurement'}
            {step === 2 && 'Enter RFQ details and define your freight lanes'}
            {step === 3 && 'Configure how the reverse auction will operate'}
            {step === 4 && 'Review and create your auction RFQ'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {step > 1 && (
              <div className="flex justify-between pt-4 border-t border-border/50">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 | 4 : s))}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                {step < 4 ? (
                  <Button 
                    type="button"
                    onClick={() => setStep((s) => (s < 4 ? (s + 1) as 1 | 2 | 3 | 4 : s))}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-accent/90"
                    disabled={createRfq.isPending}
                  >
                    {createRfq.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Auction RFQ
                  </Button>
                )}
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Lane Form Section Component
interface LaneFormSectionProps {
  form: UseFormReturn<ExtendedRfqInput>;
  index: number;
  isSpot: boolean;
  fieldsLength: number;
  onRemove: () => void;
  shippers: any[];
  consignees: any[];
}

function LaneFormSection({ form, index, isSpot, fieldsLength, onRemove, shippers, consignees }: LaneFormSectionProps) {
  const laneShipperId = useWatch({ control: form.control, name: `lanes.${index}.shipper_id` });
  const laneConsigneeId = useWatch({ control: form.control, name: `lanes.${index}.consignee_id` });
  
  const selectedShipper = shippers.find(s => s.id === laneShipperId);
  const selectedConsignee = consignees.find(c => c.id === laneConsigneeId);

  // Auto-populate addresses when shipper/consignee changes
  const updateAddresses = (type: 'shipper' | 'consignee', id: string) => {
    if (type === 'shipper') {
      const shipper = shippers.find(s => s.id === id);
      if (shipper) {
        form.setValue(`lanes.${index}.origin_city`, shipper.city || '');
        form.setValue(`lanes.${index}.origin_country`, shipper.country || '');
        form.setValue(`lanes.${index}.origin_port`, shipper.port_code || '');
        form.setValue(`lanes.${index}.origin_address`, getEntityAddress(shipper));
      }
    } else {
      const consignee = consignees.find(c => c.id === id);
      if (consignee) {
        form.setValue(`lanes.${index}.destination_city`, consignee.city || '');
        form.setValue(`lanes.${index}.destination_country`, consignee.country || '');
        form.setValue(`lanes.${index}.destination_port`, consignee.port_code || '');
        form.setValue(`lanes.${index}.destination_address`, getEntityAddress(consignee));
      }
    }
  };

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Lane {index + 1}
        </span>
        {fieldsLength > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lane-level Shipper/Consignee (optional override) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`lanes.${index}.shipper_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Lane Shipper (override)</FormLabel>
              <Select 
                onValueChange={(v) => {
                  field.onChange(v);
                  updateAddresses('shipper', v);
                }} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Use RFQ shipper" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {shippers.map((shipper) => (
                    <SelectItem key={shipper.id} value={shipper.id}>
                      {shipper.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.consignee_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Lane Consignee (override)</FormLabel>
              <Select 
                onValueChange={(v) => {
                  field.onChange(v);
                  updateAddresses('consignee', v);
                }} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Use RFQ consignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {consignees.map((consignee) => (
                    <SelectItem key={consignee.id} value={consignee.id}>
                      {consignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField
          control={form.control}
          name={`lanes.${index}.origin_city`}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin City</FormLabel>
              <FormControl>
                <Input placeholder="Shanghai" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.origin_country`}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin Country</FormLabel>
              <FormControl>
                <Input placeholder="China" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.origin_port`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Origin Port
              </FormLabel>
              <FormControl>
                <Input placeholder="CNSHA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.origin_address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin Address</FormLabel>
              <FormControl>
                <Input placeholder="Full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.destination_city`}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination City</FormLabel>
              <FormControl>
                <Input placeholder="Los Angeles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.destination_country`}
          rules={{ required: 'Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Country</FormLabel>
              <FormControl>
                <Input placeholder="USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.destination_port`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Destination Port
              </FormLabel>
              <FormControl>
                <Input placeholder="USLAX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.destination_address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Address</FormLabel>
              <FormControl>
                <Input placeholder="Full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.equipment_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Type</FormLabel>
              <FormControl>
                <Input placeholder="40' HC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.estimated_volume`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Est. Volume</FormLabel>
              <FormControl>
                <Input placeholder="50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.volume_unit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  <SelectItem value="TEU">TEU</SelectItem>
                  <SelectItem value="FEU">FEU</SelectItem>
                  <SelectItem value="CBM">CBM</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="tons">tons</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`lanes.${index}.frequency`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="ad-hoc">Ad-hoc</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Cargo Dimensions for each lane */}
      <LaneDimensionsSection form={form} laneIndex={index} isSpot={isSpot} />
    </div>
  );
}
