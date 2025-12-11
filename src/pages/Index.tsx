import { Package, TrendingUp, AlertTriangle, DollarSign, Clock, CheckCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { ShipmentMap } from "@/components/dashboard/ShipmentMap";
import { ShipmentTable } from "@/components/dashboard/ShipmentTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

const Index = () => {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Control Tower
            </h1>
            <p className="mt-1 text-muted-foreground">
              Real-time visibility across your global supply chain
            </p>
          </div>
          <QuickActions />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Shipments"
          value="258"
          change={12}
          changeLabel="vs last month"
          icon={<Package className="h-6 w-6" />}
          variant="accent"
        />
        <KPICard
          title="On-Time Rate"
          value="94.2%"
          change={2.4}
          changeLabel="vs last month"
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
        />
        <KPICard
          title="Active Alerts"
          value="12"
          change={-18}
          changeLabel="vs last week"
          icon={<AlertTriangle className="h-6 w-6" />}
          variant="warning"
        />
        <KPICard
          title="Monthly Spend"
          value="$1.2M"
          change={-5}
          changeLabel="vs budget"
          icon={<DollarSign className="h-6 w-6" />}
          variant="default"
        />
      </div>

      {/* Map Section */}
      <div className="mb-8">
        <ShipmentMap />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shipment Table - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <ShipmentTable />
          <PerformanceChart />
        </div>

        {/* Alerts Panel - 1 column */}
        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
