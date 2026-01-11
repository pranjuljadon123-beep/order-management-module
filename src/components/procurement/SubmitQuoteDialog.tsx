import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateQuote, useCarriers } from '@/hooks/useProcurement';
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
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { CreateQuoteInput, QuoteType, Surcharge } from '@/types/procurement';

interface SubmitQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfqId: string;
  laneId: string;
}

interface QuoteFormData {
  carrier_id: string;
  quote_type: QuoteType;
  base_freight_rate: number;
  currency: string;
  rate_unit: string;
  transit_time_days: number;
  validity_start: string;
  validity_end: string;
  surcharges: Surcharge[];
  notes: string;
}

export function SubmitQuoteDialog({ open, onOpenChange, rfqId, laneId }: SubmitQuoteDialogProps) {
  const { data: carriers } = useCarriers();
  const createQuote = useCreateQuote();

  const form = useForm<QuoteFormData>({
    defaultValues: {
      carrier_id: '',
      quote_type: 'contract',
      base_freight_rate: 0,
      currency: 'USD',
      rate_unit: 'per container',
      transit_time_days: 0,
      validity_start: '',
      validity_end: '',
      surcharges: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'surcharges',
  });

  const onSubmit = async (data: QuoteFormData) => {
    await createQuote.mutateAsync({
      rfq_id: rfqId,
      lane_id: laneId,
      carrier_id: data.carrier_id,
      quote_type: data.quote_type,
      base_freight_rate: data.base_freight_rate,
      currency: data.currency,
      rate_unit: data.rate_unit,
      transit_time_days: data.transit_time_days,
      validity_start: data.validity_start || undefined,
      validity_end: data.validity_end || undefined,
      surcharges: data.surcharges,
      notes: data.notes || undefined,
    });
    onOpenChange(false);
    form.reset();
  };

  const addSurcharge = () => {
    append({ name: '', amount: 0, type: 'fixed' });
  };

  // Calculate total
  const watchedValues = form.watch();
  const surchargesTotal = (watchedValues.surcharges || []).reduce((sum, s) => {
    return sum + (s.type === 'fixed' ? (s.amount || 0) : (watchedValues.base_freight_rate || 0) * ((s.amount || 0) / 100));
  }, 0);
  const totalCost = (watchedValues.base_freight_rate || 0) + surchargesTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Submit Quote</DialogTitle>
          <DialogDescription>
            Enter carrier quote details for this lane.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Carrier Selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="carrier_id"
                rules={{ required: 'Carrier is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select carrier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        {(carriers || []).map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name} ({carrier.code})
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
                name="quote_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="contract">Contract Rate</SelectItem>
                        <SelectItem value="spot">Spot Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Pricing */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="base_freight_rate"
                rules={{ required: 'Rate is required', min: { value: 0, message: 'Must be positive' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Freight Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="per container">Per Container</SelectItem>
                        <SelectItem value="per TEU">Per TEU</SelectItem>
                        <SelectItem value="per CBM">Per CBM</SelectItem>
                        <SelectItem value="per kg">Per kg</SelectItem>
                        <SelectItem value="per shipment">Per Shipment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Surcharges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Surcharges</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addSurcharge}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`surcharges.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Surcharge name (e.g., BAF)" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`surcharges.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`surcharges.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-28">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover">
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Total Summary */}
              <div className="bg-muted/30 rounded-lg p-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Base Rate</span>
                  <span>{watchedValues.currency} {(watchedValues.base_freight_rate || 0).toFixed(2)}</span>
                </div>
                {surchargesTotal > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Surcharges</span>
                    <span>+{watchedValues.currency} {surchargesTotal.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Landed Cost</span>
                  <span className="text-accent">{watchedValues.currency} {totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Transit & Validity */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="transit_time_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transit Time (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validity_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validity_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid To</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional terms or conditions..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={createQuote.isPending}
              >
                {createQuote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Quote
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
