import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: "default" | "accent" | "success" | "warning";
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = "default",
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        "kpi-card bg-card",
        variant === "accent" && "border-l-4 border-l-accent",
        variant === "success" && "border-l-4 border-l-success",
        variant === "warning" && "border-l-4 border-l-warning"
      )}
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground animate-count-up">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {isPositive && (
                <span className="flex items-center text-sm font-medium text-success">
                  <ArrowUpRight className="h-4 w-4" />
                  {change}%
                </span>
              )}
              {isNegative && (
                <span className="flex items-center text-sm font-medium text-destructive">
                  <ArrowDownRight className="h-4 w-4" />
                  {Math.abs(change)}%
                </span>
              )}
              {changeLabel && (
                <span className="text-sm text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            variant === "default" && "bg-secondary text-foreground",
            variant === "accent" && "bg-cyan-light text-accent",
            variant === "success" && "bg-success-light text-success",
            variant === "warning" && "bg-warning-light text-warning"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
