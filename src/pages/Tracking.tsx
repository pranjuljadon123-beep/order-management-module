import { AppLayout } from "@/components/layout/AppLayout";
import { TrackingSidebar } from "@/components/tracking/TrackingSidebar";
import { TrackingHeader } from "@/components/tracking/TrackingHeader";
import { IncidentAlert } from "@/components/tracking/IncidentAlert";
import { QuickAddShipment } from "@/components/tracking/QuickAddShipment";
import { ShipmentList } from "@/components/tracking/ShipmentList";
import { AddShipmentDialog } from "@/components/tracking/AddShipmentDialog";
import { BulkUploadDialog } from "@/components/tracking/BulkUploadDialog";
import { ShipmentDetailView } from "@/components/tracking/ShipmentDetailView";
import { useTracking } from "@/hooks/useTracking";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Tracking = () => {
  const {
    shipments,
    incidents,
    viewMode,
    setViewMode,
    timeFilter,
    setTimeFilter,
    shipmentFilter,
    setShipmentFilter,
    sortOption,
    setSortOption,
    showDelayed,
    setShowDelayed,
    showLast24Hours,
    setShowLast24Hours,
    searchQuery,
    setSearchQuery,
    stats,
    activeFiltersCount,
    sidebarCollapsed,
    setSidebarCollapsed,
    isAddShipmentOpen,
    setIsAddShipmentOpen,
    isBulkUploadOpen,
    setIsBulkUploadOpen,
    addShipment,
    markAlertAsRead,
    markIncidentAsRead,
    resetFilters,
    exportData,
    selectedShipment,
    setSelectedShipment,
  } = useTracking();

  const handleViewImpacted = (incident: { id: string; impactedCount: number }) => {
    setShipmentFilter("delayed");
    markIncidentAsRead(incident.id);
    toast.info(`Showing ${incident.impactedCount} impacted containers`);
  };

  const handleViewIntegrations = () => {
    toast.info("Integrations panel coming soon!");
  };

  // If a shipment is selected, show the detail view
  if (selectedShipment) {
    return (
      <AppLayout>
        <div className="h-full -mx-6 -mt-6">
          <ShipmentDetailView
            shipment={selectedShipment}
            onBack={() => setSelectedShipment(null)}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full -mx-6 -mt-6">
        {/* Sidebar */}
        <TrackingSidebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          shipmentFilter={shipmentFilter}
          setShipmentFilter={setShipmentFilter}
          stats={stats}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onBulkUpload={() => setIsBulkUploadOpen(true)}
        />

        {/* Main Content - Transitions smoothly when sidebar collapses */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300"
        )}>
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border bg-background flex-shrink-0">
            <TrackingHeader
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              sortOption={sortOption}
              setSortOption={setSortOption}
              showDelayed={showDelayed}
              setShowDelayed={setShowDelayed}
              showLast24Hours={showLast24Hours}
              setShowLast24Hours={setShowLast24Hours}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFiltersCount={activeFiltersCount}
              onResetFilters={resetFilters}
              onAddShipment={() => setIsAddShipmentOpen(true)}
              onExport={exportData}
            />
          </div>

          {/* Content - Grid auto-adjusts based on available space */}
          <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 bg-muted/30 overflow-auto">
            {/* Incident Alert */}
            <IncidentAlert
              incidents={incidents}
              onViewImpacted={handleViewImpacted}
              onDismiss={markIncidentAsRead}
            />

            {/* Quick Add */}
            <QuickAddShipment
              onAddShipment={addShipment}
              onViewIntegrations={handleViewIntegrations}
            />

            {/* Shipment List */}
            <ShipmentList
              shipments={shipments}
              viewMode={viewMode}
              onSelectShipment={setSelectedShipment}
              onMarkAlertRead={markAlertAsRead}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddShipmentDialog
        open={isAddShipmentOpen}
        onOpenChange={setIsAddShipmentOpen}
        onAddShipment={addShipment}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onUploadComplete={(count) => {
          toast.success(`${count} shipments added to tracking`);
        }}
      />
    </AppLayout>
  );
};

export default Tracking;
