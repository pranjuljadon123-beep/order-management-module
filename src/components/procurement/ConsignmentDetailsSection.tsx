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
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useShippers, useConsignees, useCustomers, getEntityAddress } from '@/hooks/useEntities';
import { CARGO_TYPES, WEIGHT_UNITS } from '@/types/entities';
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Consignment Details</h3>
          <p className="text-sm text-muted-foreground">
            {isSpot 
              ? 'Required for spot shipments' 
              : 'Optional - can be added when placing slots'}
          </p>
        </div>
      </div>

      <Separator />

      {/* Shipment Direction - Import/Export */}
      <div>
        <Label className="text-sm font-medium">Shipment Direction {isSpot && <span className="text-destructive">*</span>}</Label>
        <FormField
          control={form.control}
          name="shipment_direction"
          rules={isSpot ? { required: 'Please select shipment direction' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-2 grid gap-3 sm:grid-cols-2"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="import" id="import" />
                    <div className="flex items-center gap-2">
                      <ArrowDownToLine className="h-5 w-5 text-primary" />
                      <div>
                        <Label htmlFor="import" className="cursor-pointer font-medium">Import</Label>
                        <p className="text-xs text-muted-foreground">Receiving goods (PO required)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4 cursor-pointer hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="export" id="export" />
                    <div className="flex items-center gap-2">
                      <ArrowUpFromLine className="h-5 w-5 text-accent" />
                      <div>
                        <Label htmlFor="export" className="cursor-pointer font-medium">Export</Label>
                        <p className="text-xs text-muted-foreground">Sending goods (SO required)</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Order Number - Conditional based on direction */}
      {(isImport || isExport) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {isImport && (
            <FormField
              control={form.control}
              name="po_number"
              rules={isSpot ? { required: 'PO Number is required for import shipments' } : {}}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Order (PO) {isSpot && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PO-2025-001234" {...field} />
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
              rules={isSpot ? { required: 'SO Number is required for export shipments' } : {}}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Order (SO) {isSpot && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SO-2025-005678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Customer, Shipper, Consignee */}
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="customer_id"
          rules={isSpot ? { required: 'Customer is required for spot RFQs' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.code && `(${customer.code})`}
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
          rules={isSpot ? { required: 'Shipper is required for spot RFQs' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipper {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipper" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {shippers.map((shipper) => (
                    <SelectItem key={shipper.id} value={shipper.id}>
                      {shipper.name} {shipper.code && `(${shipper.code})`}
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
          rules={isSpot ? { required: 'Consignee is required for spot RFQs' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Consignee {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select consignee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {consignees.map((consignee) => (
                    <SelectItem key={consignee.id} value={consignee.id}>
                      {consignee.name} {consignee.code && `(${consignee.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Auto-populated addresses */}
      {(selectedShipper || selectedConsignee || selectedCustomer) && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Auto-populated Addresses</h4>
          <div className="grid gap-3 text-sm">
            {selectedShipper && (
              <div className="flex gap-2">
                <span className="font-medium min-w-24">Origin:</span>
                <span className="text-muted-foreground">{getEntityAddress(selectedShipper) || 'No address on file'}</span>
              </div>
            )}
            {selectedConsignee && (
              <div className="flex gap-2">
                <span className="font-medium min-w-24">Destination:</span>
                <span className="text-muted-foreground">{getEntityAddress(selectedConsignee) || 'No address on file'}</span>
              </div>
            )}
            {selectedCustomer && (
              <div className="flex gap-2">
                <span className="font-medium min-w-24">Customer:</span>
                <span className="text-muted-foreground">{getEntityAddress(selectedCustomer) || 'No address on file'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cargo Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="cargo_type"
          rules={isSpot ? { required: 'Cargo type is required for spot RFQs' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo Type {isSpot && <span className="text-destructive">*</span>}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo type" />
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
            <FormItem>
              <FormLabel>Cargo Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Electronic components, Auto parts" {...field} />
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
        rules={isSpot ? { required: 'Pickup date is required for spot RFQs' } : {}}
        render={({ field }) => (
          <FormItem className="sm:w-1/2">
            <FormLabel>Pickup Date {isSpot && <span className="text-destructive">*</span>}</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dimensions Section - Only for Spot */}
      {isSpot && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-4">Cargo Dimensions</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="weight_value"
                rules={{ required: 'Weight is required for spot RFQs' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'KG'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {WEIGHT_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
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
                name="volume_cbm"
                rules={{ required: 'Volume is required for spot RFQs' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (CBM) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001"
                        placeholder="0.000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                rules={{ required: 'Quantity is required for spot RFQs' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
