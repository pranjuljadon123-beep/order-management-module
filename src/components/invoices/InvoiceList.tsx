import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceRow } from "./InvoiceRow";
import type { Invoice } from "@/types/invoices";
import { toast } from "sonner";

interface InvoiceListProps {
  invoices: Invoice[];
  selectedInvoices: string[];
  onToggleSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onDelete: (ids: string[]) => void;
}

export function InvoiceList({
  invoices,
  selectedInvoices,
  onToggleSelect,
  onToggleStar,
  onSelectInvoice,
  onDelete,
}: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No invoices found</p>
        <p className="text-sm">Try adjusting your filters or upload new invoices</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="min-w-[1200px]">
        {invoices.map((invoice) => (
          <InvoiceRow
            key={invoice.id}
            invoice={invoice}
            isSelected={selectedInvoices.includes(invoice.id)}
            onSelect={() => onToggleSelect(invoice.id)}
            onToggleStar={() => onToggleStar(invoice.id)}
            onClick={() => onSelectInvoice(invoice)}
            onDownload={() => toast.info("Downloading invoice...")}
            onDelete={() => onDelete([invoice.id])}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
