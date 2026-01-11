import { UseFormReturn, useWatch } from 'react-hook-form';
import {
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useShippers, useConsignees, useCustomers, getEntityAddress } from '@/hooks/useEntities';
import { CARGO_TYPES } from '@/types/entities';
import { Package, Building2, Truck, User, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface ConsignmentDetailsSectionProps {
  form: UseFormReturn<any>;
  rfqType: 'spot' | 'contract' | null;
}

export function ConsignmentDetailsSection({ form, rfqType }: ConsignmentDetailsSectionProps) {
  const { data: shippers = [] } = useShippers();
  const { data: consignees = [] } = useConsignees();
  const { data: customers = [] } = useCustomers();

  const selectedShipperId = useWatch({ control: form.control, name: 'shipper_id' });
  const selectedConsigneeId = useWatch({ control: form.control, name: 'consignee_id' });
  const selectedCustomerId = useWatch({ control: form.control, name: 'customer_id' });
  const shipmentDirection = useWatch({ control: form.control, name: 'shipment_direction' });

  const selectedShipper = shippers.find(s => s.id === selectedShipperId);
  const selectedConsignee = consignees.find(c => c.id === selectedConsigneeId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const isSpot = rfqType === 'spot';
  const isImport = shipmentDirection === 'import';
  const isExport = shipmentDirection === 'export';

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Consignment Details</h3>
          <p className="text-xs text-muted-foreground">
            {isSpot ? 'Required for spot shipments' : 'Optional - can be specified later'}
          </p>
        </div>
      </div>

      {/* Shipment Direction */}
      <FormField
        control={form.control}
        name="shipment_direction"
        rules={isSpot ? { required: 'Please select shipment direction' } : {}}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Direction {isSpot && <span className="text-destructive">*</span>}
            </FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid gap-2 sm:grid-cols-2"
              >
                <label 
                  htmlFor="import" 
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    field.value === 'import' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <RadioGroupItem value="import" id="import" />
                  <ArrowDownToLine className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-medium text-sm">Import</span>
                    <p className="text-xs text-muted-foreground">Receiving goods</p>
                  </div>
                </label>
                <label 
                  htmlFor="export" 
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    field.value === 'export' 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border/50 hover:border-accent/30'
                  }`}
                >
                  <RadioGroupItem value="export" id="export" />
                  <ArrowUpFromLine className="h-4 w-4 text-accent" />
                  <div>
                    <span className="font-medium text-sm">Export</span>
                    <p className="text-xs text-muted-foreground">Sending goods</p>
                  </div>
                </label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Order Number - Conditional */}
      {(isImport || isExport) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {isImport && (
            <FormField
              control={form.control}
              name="po_number"
              rules={isSpot ? { required: 'PO Number required' } : {}}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    PO Number {isSpot && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="PO-2025-001234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {isExport && (
            <FormField
              control={form.control}
              name="so_number"
              rules={isSpot ? { required: 'SO Number required' } : {}}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    SO Number {isSpot && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="SO-2025-005678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Entities Selection */}
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="customer_id"
          rules={isSpot ? { required: 'Customer required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Customer {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
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
          name="shipper_id"
          rules={isSpot ? { required: 'Shipper required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs flex items-center gap-1.5">
                <Truck className="h-3 w-3" />
                Shipper {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select" />
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
          name="consignee_id"
          rules={isSpot ? { required: 'Consignee required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                Consignee {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select" />
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

      {/* Auto-populated addresses - Compact */}
      {(selectedShipper || selectedConsignee || selectedCustomer) && (
        <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-xs space-y-1">
          {selectedShipper && (
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-20">Origin:</span>
              <span className="text-foreground truncate">{getEntityAddress(selectedShipper) || 'No address'}</span>
            </div>
          )}
          {selectedConsignee && (
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-20">Destination:</span>
              <span className="text-foreground truncate">{getEntityAddress(selectedConsignee) || 'No address'}</span>
            </div>
          )}
        </div>
      )}

      {/* Cargo Info */}
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="cargo_type"
          rules={isSpot ? { required: 'Cargo type required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Cargo Type {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {CARGO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
          name="cargo_description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className="text-xs">Cargo Description</FormLabel>
              <FormControl>
                <Input className="h-9" placeholder="e.g., Electronic components" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Pickup Date */}
      <FormField
        control={form.control}
        name="pickup_date"
        rules={isSpot ? { required: 'Pickup date required' } : {}}
        render={({ field }) => (
          <FormItem className="sm:w-48">
            <FormLabel className="text-xs">
              Pickup Date {isSpot && <span className="text-destructive">*</span>}
            </FormLabel>
            <FormControl>
              <Input type="date" className="h-9" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
