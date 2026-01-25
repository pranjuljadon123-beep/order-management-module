import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DocumentStatus, DocumentType } from '@/types/documents';

interface DocumentsFiltersProps {
  filters: {
    status?: DocumentStatus;
    document_type?: DocumentType;
    search?: string;
  };
  onFiltersChange: (filters: DocumentsFiltersProps['filters']) => void;
}

export function DocumentsFilters({ filters, onFiltersChange }: DocumentsFiltersProps) {
  const hasFilters = Object.values(filters).some(v => v);

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents by number, name..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.document_type || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              document_type: value === 'all' ? undefined : (value as DocumentType),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="commercial_invoice">Commercial Invoice</SelectItem>
            <SelectItem value="packing_list">Packing List</SelectItem>
            <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
            <SelectItem value="airway_bill">Air Waybill</SelectItem>
            <SelectItem value="certificate_of_origin">Certificate of Origin</SelectItem>
            <SelectItem value="proof_of_delivery">Proof of Delivery</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : (value as DocumentStatus),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
