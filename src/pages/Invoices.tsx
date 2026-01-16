import { AppLayout } from "@/components/layout/AppLayout";
import { InvoiceSidebar } from "@/components/invoices/InvoiceSidebar";
import { InvoiceToolbar } from "@/components/invoices/InvoiceToolbar";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";
import { UploadInvoiceDialog } from "@/components/invoices/UploadInvoiceDialog";
import { useInvoices } from "@/hooks/useInvoices";
import { toast } from "sonner";

const Invoices = () => {
  const {
    invoices,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedInvoices,
    selectedInvoice,
    setSelectedInvoice,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    toggleStar,
    toggleSelect,
    selectAll,
    approveInvoice,
    rejectInvoice,
    deleteInvoices,
  } = useInvoices();

  // If an invoice is selected, show detail view
  if (selectedInvoice) {
    return (
      <AppLayout>
        <div className="h-full -mx-6 -mt-6">
          <InvoiceDetailView
            invoice={selectedInvoice}
            onBack={() => setSelectedInvoice(null)}
            onApprove={() => {
              approveInvoice(selectedInvoice.id);
              toast.success("Invoice approved");
              setSelectedInvoice(null);
            }}
            onReject={() => {
              rejectInvoice(selectedInvoice.id);
              toast.success("Invoice rejected");
              setSelectedInvoice(null);
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full -mx-6 -mt-6">
        {/* Sidebar */}
        <InvoiceSidebar
          filter={filter}
          setFilter={setFilter}
          stats={stats}
          onBulkUpload={() => setIsUploadDialogOpen(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <InvoiceToolbar
            selectedCount={selectedInvoices.length}
            totalCount={invoices.length}
            isAllSelected={selectedInvoices.length === invoices.length && invoices.length > 0}
            onSelectAll={selectAll}
            onDelete={() => {
              deleteInvoices(selectedInvoices);
              toast.success(`${selectedInvoices.length} invoice(s) deleted`);
            }}
            onExport={() => toast.info("Exporting selected invoices...")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Invoice List */}
          <InvoiceList
            invoices={invoices}
            selectedInvoices={selectedInvoices}
            onToggleSelect={toggleSelect}
            onToggleStar={toggleStar}
            onSelectInvoice={setSelectedInvoice}
            onDelete={deleteInvoices}
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadInvoiceDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadComplete={(count) => {
          toast.success(`${count} invoice(s) uploaded successfully`);
        }}
      />
    </AppLayout>
  );
};

export default Invoices;
