import { useState } from 'react';
import { useCarriers } from '@/hooks/useProcurement';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Building2, Search, Star, Ship, Plane, Truck, 
  CheckCircle2, Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Carrier } from '@/types/procurement';

interface VendorSelectionSectionProps {
  selectedVendors: string[];
  onVendorsChange: (vendors: string[]) => void;
  mode?: string;
}

const getModeIcon = (modes: string[] | null) => {
  if (!modes || modes.length === 0) return Building2;
  if (modes.includes('ocean_fcl') || modes.includes('ocean_lcl')) return Ship;
  if (modes.includes('air')) return Plane;
  if (modes.includes('road_ftl') || modes.includes('road_ltl')) return Truck;
  return Building2;
};

export function VendorSelectionSection({ 
  selectedVendors, 
  onVendorsChange,
  mode 
}: VendorSelectionSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: carriers = [], isLoading } = useCarriers();

  // Filter carriers by search term and optionally by supported mode
  const filteredCarriers = carriers.filter(carrier => {
    const matchesSearch = carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         carrier.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If mode is specified, optionally filter by supported modes
    // For now, show all carriers regardless of mode since this field might not be populated
    return matchesSearch;
  });

  const handleToggleVendor = (carrierId: string) => {
    if (selectedVendors.includes(carrierId)) {
      onVendorsChange(selectedVendors.filter(id => id !== carrierId));
    } else {
      onVendorsChange([...selectedVendors, carrierId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === filteredCarriers.length) {
      onVendorsChange([]);
    } else {
      onVendorsChange(filteredCarriers.map(c => c.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Invite Vendors to Bid</h3>
          <p className="text-sm text-muted-foreground">
            Select which carriers can participate in this auction
          </p>
        </div>
      </div>

      {/* Search and Select All */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm font-medium text-primary hover:underline"
        >
          {selectedVendors.length === filteredCarriers.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Selected count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
        </Badge>
        {selectedVendors.length === 0 && (
          <span className="text-sm text-destructive">
            Please select at least one vendor
          </span>
        )}
      </div>

      {/* Vendors Grid */}
      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border/50">
        {filteredCarriers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mb-2" />
            <p>No vendors found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredCarriers.map((carrier) => {
              const isSelected = selectedVendors.includes(carrier.id);
              const ModeIcon = getModeIcon(carrier.supported_modes);
              
              return (
                <label
                  key={carrier.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                    isSelected 
                      ? "bg-primary/5 hover:bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleVendor(carrier.id)}
                  />
                  
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <ModeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{carrier.name}</span>
                      {carrier.code && (
                        <Badge variant="outline" className="text-xs">
                          {carrier.code}
                        </Badge>
                      )}
                    </div>
                    {carrier.contact_email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {carrier.contact_email}
                      </p>
                    )}
                  </div>
                  
                  {carrier.rating && carrier.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-muted-foreground">{carrier.rating.toFixed(1)}</span>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
      
      {carriers.length > 0 && filteredCarriers.length < carriers.length && (
        <p className="text-xs text-muted-foreground">
          Showing {filteredCarriers.length} of {carriers.length} vendors
        </p>
      )}
    </div>
  );
}
