import { AppLayout } from "@/components/layout/AppLayout";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendingUp, TrendingDown, Clock, Target } from "lucide-react";

const Analytics = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics & Intelligence
        </h1>
        <p className="mt-1 text-muted-foreground">
          Insights and trends across your supply chain
        </p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Cost per TEU"
          value="$2,340"
          change={-8}
          changeLabel="vs last quarter"
          icon={<TrendingDown className="h-6 w-6" />}
          variant="success"
        />
        <KPICard
          title="Avg Transit Time"
          value="18.5 days"
          change={-12}
          changeLabel="improvement"
          icon={<Clock className="h-6 w-6" />}
          variant="accent"
        />
        <KPICard
          title="Carrier Score"
          value="4.2/5"
          change={5}
          changeLabel="vs last month"
          icon={<Target className="h-6 w-6" />}
          variant="default"
        />
        <KPICard
          title="YTD Savings"
          value="$284K"
          change={15}
          changeLabel="vs target"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart />
        <PerformanceChart />
      </div>
    </AppLayout>
  );
};

export default Analytics;
