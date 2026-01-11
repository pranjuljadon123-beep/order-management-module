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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Ruler } from 'lucide-react';
import { useState } from 'react';
import { WEIGHT_UNITS, VOLUME_UNITS, DIMENSION_UNITS, PACKAGE_TYPES } from '@/types/entities';

interface LaneDimensionsSectionProps {
  form: UseFormReturn<any>;
  laneIndex: number;
  isSpot: boolean;
}

export function LaneDimensionsSection({ form, laneIndex, isSpot }: LaneDimensionsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
          <span className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Cargo Dimensions {isSpot && '(Required)'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
        {/* Weight & Volume */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name={`lanes.${laneIndex}.weight_value`}
            rules={isSpot ? { required: 'Weight required' } : {}}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight {isSpot && <span className="text-destructive">*</span>}</FormLabel>
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
            name={`lanes.${laneIndex}.weight_unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
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
            name={`lanes.${laneIndex}.volume_cbm`}
            rules={isSpot ? { required: 'Volume required' } : {}}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (CBM) {isSpot && <span className="text-destructive">*</span>}</FormLabel>
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
            name={`lanes.${laneIndex}.quantity`}
            rules={isSpot ? { required: 'Quantity required' } : {}}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity {isSpot && <span className="text-destructive">*</span>}</FormLabel>
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

        {/* Package Type & Dimensions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FormField
            control={form.control}
            name={`lanes.${laneIndex}.package_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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

          <FormField
            control={form.control}
            name={`lanes.${laneIndex}.dimensions_length`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="L" 
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
            name={`lanes.${laneIndex}.dimensions_width`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="W" 
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
            name={`lanes.${laneIndex}.dimensions_height`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="H" 
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
            name={`lanes.${laneIndex}.dimensions_unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'CM'}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
