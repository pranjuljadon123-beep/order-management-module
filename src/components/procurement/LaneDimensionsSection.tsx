import { UseFormReturn } from 'react-hook-form';
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
import { WEIGHT_UNITS, DIMENSION_UNITS, PACKAGE_TYPES } from '@/types/entities';
import { Package, Ruler } from 'lucide-react';

interface LaneDimensionsSectionProps {
  form: UseFormReturn<any>;
  laneIndex: number;
  isSpot: boolean;
}

export function LaneDimensionsSection({ form, laneIndex, isSpot }: LaneDimensionsSectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-border/30">
      {/* Section Label */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Package className="h-3.5 w-3.5" />
        <span className="font-medium">Cargo Specifications</span>
        {isSpot && <span className="text-destructive text-[10px]">Required</span>}
      </div>

      {/* Weight, Volume, Quantity Row */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        <FormField
          control={form.control}
          name={`lanes.${laneIndex}.weight_value`}
          rules={isSpot ? { required: 'Required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Weight {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="h-8 text-sm"
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
          name={`lanes.${laneIndex}.weight_unit`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'KG'}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm">
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
          name={`lanes.${laneIndex}.volume_cbm`}
          rules={isSpot ? { required: 'Required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Volume (CBM) {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.001"
                  placeholder="0.000"
                  className="h-8 text-sm"
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
          name={`lanes.${laneIndex}.quantity`}
          rules={isSpot ? { required: 'Required' } : {}}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Qty {isSpot && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0"
                  className="h-8 text-sm"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Package & Dimensions Row */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
        <FormField
          control={form.control}
          name={`lanes.${laneIndex}.package_type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Package</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover">
                  {PACKAGE_TYPES.map((type) => (
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

        <div className="col-span-1 sm:col-span-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Ruler className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Dimensions (L × W × H)</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <FormField
              control={form.control}
              name={`lanes.${laneIndex}.dimensions_length`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="L"
                      className="h-8 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`lanes.${laneIndex}.dimensions_width`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="W"
                      className="h-8 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`lanes.${laneIndex}.dimensions_height`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="H"
                      className="h-8 text-sm"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`lanes.${laneIndex}.dimensions_unit`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'CM'}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      {DIMENSION_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
