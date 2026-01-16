import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Paperclip,
  Plane,
  Ship,
  Truck,
  Train,
  Info,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice, TransportMode } from "@/types/invoices";
import { format } from "date-fns";

interface InvoiceRowProps {
  invoice: Invoice;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
  onClick: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const getModeIcon = (mode: TransportMode) => {
  switch (mode) {
    case "air": return Plane;
    case "fcl":
    case "lcl": return Ship;
    case "road": return Truck;
    case "rail": return Train;
    default: return Ship;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "PENDING", className: "bg-amber-100 text-amber-700 border-amber-300" };
    case "pending_approval":
      return { label: "PENDING", className: "bg-amber-100 text-amber-700 border-amber-300" };
    case "approved":
      return { label: "APPROVED", className: "bg-green-100 text-green-700 border-green-300" };
    case "auto_approved":
      return { label: "AUTO APPROVED", className: "bg-emerald-100 text-emerald-700 border-emerald-300" };
    case "rejected":
      return { label: "REJECTED", className: "bg-red-100 text-red-700 border-red-300" };
    case "payment_processed":
      return { label: "PAID", className: "bg-blue-100 text-blue-700 border-blue-300" };
    case "canceled":
      return { label: "CANCELED", className: "bg-gray-100 text-gray-600 border-gray-300" };
    case "archived":
      return { label: "ARCHIVED", className: "bg-gray-100 text-gray-500 border-gray-200" };
    default:
      return { label: status.toUpperCase(), className: "bg-gray-100 text-gray-600" };
  }
};

export function InvoiceRow({
  invoice,
  isSelected,
  onSelect,
  onToggleStar,
  onClick,
  onDownload,
  onDelete,
}: InvoiceRowProps) {
  const ModeIcon = getModeIcon(invoice.mode);
  const statusBadge = getStatusBadge(invoice.status);
  const difference = invoice.invoiceAmount - invoice.expectedAmount;
  const hasDifference = Math.abs(difference) > 0.01;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer group",
        isSelected && "bg-primary/5"
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect()}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      />

      {/* Star */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 flex-shrink-0",
          invoice.isStarred ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar();
        }}
      >
        <Star className={cn("h-4 w-4", invoice.isStarred && "fill-current")} />
      </Button>

      {/* Title & Attachment */}
      <div className="min-w-[180px] max-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">{invoice.title}</span>
          {invoice.hasAttachment && (
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Next Approvers */}
      <div className="min-w-[120px] text-sm text-muted-foreground">
        Next approvers:
        {invoice.approvers.length > 0 ? (
          <span className="text-foreground ml-1">{invoice.approvers.join(", ")}</span>
        ) : null}
      </div>

      {/* Status */}
      <div className="min-w-[110px]">
        <Badge
          variant="outline"
          className={cn("font-medium text-xs", statusBadge.className)}
        >
          {statusBadge.label}
          {invoice.isPriority && (
            <AlertCircle className="h-3 w-3 ml-1 text-destructive" />
          )}
        </Badge>
      </div>

      {/* Vendor */}
      <div className="min-w-[140px] max-w-[160px]">
        <div className="text-xs text-muted-foreground">Vendor: {invoice.vendor.name.slice(0, 18)}...</div>
      </div>

      {/* Invoice Number */}
      <div className="min-w-[130px]">
        <div className="text-sm text-foreground">
          Invoice: {invoice.invoiceNumber || <span className="text-muted-foreground">—</span>}
        </div>
      </div>

      {/* Mode & Route */}
      <div className="min-w-[200px] flex-1">
        <div className="flex items-center gap-2 text-xs mb-1">
          <ModeIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">MODE:</span>
          <span className="font-medium text-foreground">{invoice.mode.toUpperCase()}</span>
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">GID: {invoice.gid}</div>
        <div className="flex flex-col gap-0.5 mt-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span>{getFlagEmoji(invoice.origin.countryCode)}</span>
            <span className="text-foreground truncate max-w-[160px]">{invoice.origin.port}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span>{getFlagEmoji(invoice.destination.countryCode)}</span>
            <span className="text-foreground truncate max-w-[160px]">{invoice.destination.port}</span>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="min-w-[160px]">
        <div className="text-xs text-muted-foreground">
          Uploaded At: {format(invoice.uploadedAt, "dd/MM/yyyy HH:mm")}
        </div>
        {invoice.reuploadedAt && (
          <div className="text-xs text-muted-foreground">
            Reuploaded At: {format(invoice.reuploadedAt, "dd/MM/yyyy HH:mm")}
          </div>
        )}
      </div>

      {/* Difference */}
      <div className="min-w-[100px] text-right">
        {hasDifference ? (
          <>
            <div className="text-xs text-muted-foreground">
              {difference > 0 ? "Overcharged by" : "Undercharged by"}
            </div>
            <div className={cn(
              "text-sm font-medium",
              difference > 0 ? "text-destructive" : "text-green-600"
            )}>
              {Math.abs(difference).toLocaleString('en-IN', {
                style: 'currency',
                currency: invoice.currency,
                minimumFractionDigits: 2,
              })}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No Difference</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
