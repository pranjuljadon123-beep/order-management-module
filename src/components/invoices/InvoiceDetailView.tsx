import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Check,
  X,
  FileText,
  Paperclip,
  Ship,
  Plane,
  Calendar,
  DollarSign,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoices";
import { format } from "date-fns";

interface InvoiceDetailViewProps {
  invoice: Invoice;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const getStatusBadge = (status: Invoice["status"]) => {
  switch (status) {
    case "pending":
    case "pending_approval":
      return { label: "PENDING APPROVAL", className: "bg-amber-100 text-amber-700", icon: Clock };
    case "approved":
      return { label: "APPROVED", className: "bg-green-100 text-green-700", icon: CheckCircle2 };
    case "auto_approved":
      return { label: "AUTO APPROVED", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
    case "rejected":
      return { label: "REJECTED", className: "bg-red-100 text-red-700", icon: X };
    case "payment_processed":
      return { label: "PAYMENT PROCESSED", className: "bg-blue-100 text-blue-700", icon: DollarSign };
    default:
      return { label: status.toUpperCase(), className: "bg-gray-100 text-gray-600", icon: FileText };
  }
};

export function InvoiceDetailView({ invoice, onBack, onApprove, onReject }: InvoiceDetailViewProps) {
  const [activeTab, setActiveTab] = useState("details");
  const statusBadge = getStatusBadge(invoice.status);
  const StatusIcon = statusBadge.icon;
  const difference = invoice.invoiceAmount - invoice.expectedAmount;
  const hasDifference = Math.abs(difference) > 0.01;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold">{invoice.title}</h1>
                <Badge className={cn("gap-1", statusBadge.className)}>
                  <StatusIcon className="h-3 w-3" />
                  {statusBadge.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Invoice: {invoice.invoiceNumber || "—"}</span>
                <span>•</span>
                <span>GID: {invoice.gid}</span>
                <span>•</span>
                <span>Vendor: {invoice.vendor.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(invoice.status === "pending" || invoice.status === "pending_approval") && (
              <>
                <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={onReject}>
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button size="sm" className="gap-2" onClick={onApprove}>
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            <Separator orientation="vertical" className="h-8 mx-2" />
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border bg-card px-4">
              <TabsList className="h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4"
                >
                  Invoice Details
                </TabsTrigger>
                <TabsTrigger 
                  value="comparison"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4"
                >
                  Rate Comparison
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4"
                >
                  Audit History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="flex-1 m-0 p-6 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Info Card */}
                <Card className="p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Invoice Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice Number</span>
                      <span className="font-medium">{invoice.invoiceNumber || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GID</span>
                      <span className="font-medium">{invoice.gid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium flex items-center gap-1">
                        {invoice.mode === "air" ? <Plane className="h-3.5 w-3.5" /> : <Ship className="h-3.5 w-3.5" />}
                        {invoice.mode.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upload Date</span>
                      <span className="font-medium">{format(invoice.uploadedAt, "dd MMM yyyy, HH:mm")}</span>
                    </div>
                    {invoice.reuploadedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reupload Date</span>
                        <span className="font-medium">{format(invoice.reuploadedAt, "dd MMM yyyy, HH:mm")}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Vendor Info Card */}
                <Card className="p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Vendor Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vendor Name</span>
                      <span className="font-medium">{invoice.vendor.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vendor ID</span>
                      <span className="font-medium">{invoice.vendor.id}</span>
                    </div>
                  </div>
                </Card>

                {/* Route Info Card */}
                <Card className="p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Route Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Origin</span>
                      <p className="font-medium mt-0.5">{invoice.origin.port}, {invoice.origin.country}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Destination</span>
                      <p className="font-medium mt-0.5">{invoice.destination.port}, {invoice.destination.country}</p>
                    </div>
                  </div>
                </Card>

                {/* Amount Card */}
                <Card className="p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Amount Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice Amount</span>
                      <span className="font-semibold text-lg">
                        {invoice.invoiceAmount.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: invoice.currency,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Amount</span>
                      <span className="font-medium">
                        {invoice.expectedAmount.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: invoice.currency,
                        })}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {hasDifference && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        Difference
                      </span>
                      <span className={cn(
                        "font-semibold",
                        difference > 0 ? "text-destructive" : difference < 0 ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {difference > 0 ? "+" : ""}{difference.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: invoice.currency,
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="flex-1 m-0 p-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Rate Comparison</h3>
                <p className="text-muted-foreground text-sm">
                  Detailed rate comparison with contracted rates will be displayed here.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0 p-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Audit History</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Invoice uploaded</p>
                      <p className="text-xs text-muted-foreground">{format(invoice.uploadedAt, "dd MMM yyyy, HH:mm")}</p>
                    </div>
                  </div>
                  {invoice.reuploadedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium">Invoice reuploaded</p>
                        <p className="text-xs text-muted-foreground">{format(invoice.reuploadedAt, "dd MMM yyyy, HH:mm")}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                    <div>
                      <p className="text-sm font-medium">Pending approval</p>
                      <p className="text-xs text-muted-foreground">Awaiting review</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Attachment Preview Sidebar */}
        <div className="w-80 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {invoice.hasAttachment ? (
                <Card className="p-4 bg-muted/50 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Invoice_{invoice.gid}.pdf</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF Document</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </Card>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No attachments</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
