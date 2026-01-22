import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart, FileText, Truck, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SavingsModule {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  totalSavings: number;
  targetSavings: number;
  percentOfTarget: number;
  trend: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

const savingsData: SavingsModule[] = [
  {
    id: "procurement",
    name: "Procurement",
    icon: ShoppingCart,
    totalSavings: 142500,
    targetSavings: 200000,
    percentOfTarget: 71,
    trend: 12.5,
    breakdown: [
      { label: "Auction Savings", amount: 85000 },
      { label: "Rate Negotiation", amount: 42000 },
      { label: "Volume Discounts", amount: 15500 },
    ],
  },
  {
    id: "invoices",
    name: "Invoice Recovery",
    icon: FileText,
    totalSavings: 67800,
    targetSavings: 80000,
    percentOfTarget: 85,
    trend: 8.2,
    breakdown: [
      { label: "Overcharge Detection", amount: 32000 },
      { label: "Duplicate Prevention", amount: 18500 },
      { label: "Rate Reconciliation", amount: 17300 },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    icon: Truck,
    totalSavings: 53200,
    targetSavings: 75000,
    percentOfTarget: 71,
    trend: -2.3,
    breakdown: [
      { label: "Route Optimization", amount: 28000 },
      { label: "Consolidation", amount: 15200 },
      { label: "Mode Shift", amount: 10000 },
    ],
  },
  {
    id: "analytics",
    name: "Data-Driven",
    icon: BarChart3,
    totalSavings: 21500,
    targetSavings: 30000,
    percentOfTarget: 72,
    trend: 15.8,
    breakdown: [
      { label: "Demand Forecasting", amount: 12000 },
      { label: "Carrier Scoring", amount: 6500 },
      { label: "Spend Analytics", amount: 3000 },
    ],
  },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function ModularSavings() {
  const totalSavings = savingsData.reduce((acc, m) => acc + m.totalSavings, 0);
  const totalTarget = savingsData.reduce((acc, m) => acc + m.targetSavings, 0);
  const overallPercent = Math.round((totalSavings / totalTarget) * 100);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Modular Savings Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              YTD savings across all modules
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalSavings)}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{overallPercent}% of</span>
              <span className="font-medium text-foreground">{formatCurrency(totalTarget)}</span>
              <span>target</span>
            </div>
          </div>
        </div>
        <Progress value={overallPercent} className="h-2 mt-3" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {savingsData.map((module) => (
            <div
              key={module.id}
              className="rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <module.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{module.name}</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  module.trend >= 0 ? "text-success" : "text-destructive"
                )}>
                  {module.trend >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(module.trend)}%
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(module.totalSavings)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={module.percentOfTarget} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{module.percentOfTarget}%</span>
                </div>
              </div>

              <div className="space-y-1.5 mt-3 pt-3 border-t border-border">
                {module.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
