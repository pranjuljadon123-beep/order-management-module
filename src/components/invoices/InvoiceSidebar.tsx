import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  XOctagon,
  Archive,
  Star,
  Upload,
  MoreHorizontal,
} from "lucide-react";
import type { InvoiceFilter, InvoiceStats } from "@/types/invoices";

interface InvoiceSidebarProps {
  filter: InvoiceFilter;
  setFilter: (filter: InvoiceFilter) => void;
  stats: InvoiceStats;
  onBulkUpload: () => void;
}

const filterItems: { key: InvoiceFilter; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All Invoices", icon: FileText },
  { key: "payment_processed", label: "Payment Processed", icon: CreditCard },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "pending_approval", label: "Pending Approval", icon: Clock },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "canceled", label: "Canceled", icon: XOctagon },
  { key: "archived", label: "Archived", icon: Archive },
  { key: "starred", label: "Starred", icon: Star },
];

export function InvoiceSidebar({ filter, setFilter, stats, onBulkUpload }: InvoiceSidebarProps) {
  const getCount = (key: InvoiceFilter) => {
    switch (key) {
      case "all": return stats.all;
      case "payment_processed": return stats.paymentProcessed;
      case "approved": return stats.approved;
      case "pending_approval": return stats.pendingApproval;
      case "rejected": return stats.rejected;
      case "canceled": return stats.canceled;
      case "archived": return stats.archived;
      case "starred": return stats.starred;
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      {/* Upload Button */}
      <div className="p-4">
        <Button 
          className="w-full gap-2 bg-primary hover:bg-primary/90" 
          onClick={onBulkUpload}
        >
          <Upload className="h-4 w-4" />
          Bulk Upload Invoices
          <MoreHorizontal className="h-4 w-4 ml-auto" />
        </Button>
      </div>

      {/* Filter Navigation */}
      <ScrollArea className="flex-1">
        <nav className="px-2 pb-4 space-y-1">
          {filterItems.map((item) => {
            const Icon = item.icon;
            const count = getCount(item.key);
            const isActive = filter === item.key;
            const isPendingApproval = item.key === "pending_approval";

            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  isActive && "text-primary"
                )} />
                <span className="flex-1 text-left">{item.label}</span>
                {count > 0 && (
                  <Badge 
                    variant={isPendingApproval && count > 0 ? "destructive" : "secondary"}
                    className={cn(
                      "h-5 min-w-[20px] justify-center",
                      isPendingApproval && count > 0 && "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
