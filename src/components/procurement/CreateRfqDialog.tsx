import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateRfq, useCarriers } from '@/hooks/useProcurement';
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
import { Plus, Trash2, Loader2, Ship, Plane, Truck, Train } from 'lucide-react';
import type { CreateRfqInput, TransportMode } from '@/types/procurement';

interface CreateRfqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const transportModes: { value: TransportMode; label: string; icon: typeof Ship }[] = [
  { value: 'ocean_fcl', label: 'Ocean FCL', icon: Ship },
  { value: 'ocean_lcl', label: 'Ocean LCL', icon: Ship },
  { value: 'air', label: 'Air Freight', icon: Plane },
  { value: 'road_ftl', label: 'Road FTL', icon: Truck },
  { value: 'road_ltl', label: 'Road LTL', icon: Truck },
  { value: 'rail', label: 'Rail', icon: Train },
];

const incoterms = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

export function CreateRfqDialog({ open, onOpenChange }: CreateRfqDialogProps) {
  const createRfq = useCreateRfq();
  
  const form = useForm<CreateRfqInput>({
    defaultValues: {
      title: '',
      mode: 'ocean_fcl',
      incoterms: 'FOB',
      contract_duration_months: 12,
      estimated_annual_volume: '',
      bid_deadline: '',
      notes: '',
      lanes: [
        {
          origin_city: '',
          origin_country: '',
          destination_city: '',
          destination_country: '',
          equipment_type: '',
          estimated_volume: '',
          volume_unit: 'TEU',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lanes',
  });

  const onSubmit = async (data: CreateRfqInput) => {
    await createRfq.mutateAsync(data);
    onOpenChange(false);
    form.reset();
  };

  const addLane = () => {
    append({
      origin_city: '',
      origin_country: '',
      destination_city: '',
      destination_country: '',
      equipment_type: '',
      estimated_volume: '',
      volume_unit: 'TEU',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New RFQ</DialogTitle>
          <DialogDescription>
            Create a request for quotation to collect carrier bids for your freight lanes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
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
                    <FormLabel>Estimated Annual Volume</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500 TEUs, 10,000 kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                <div
                  key={field.id}
                  className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Lane {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
                </div>
              ))}
            </div>

            <Separator />

            {/* Notes */}
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

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-accent hover:bg-accent/90"
                disabled={createRfq.isPending}
              >
                {createRfq.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create RFQ
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
