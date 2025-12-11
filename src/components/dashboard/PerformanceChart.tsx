import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", onTime: 92, delayed: 8, cost: 245 },
  { month: "Feb", onTime: 88, delayed: 12, cost: 268 },
  { month: "Mar", onTime: 94, delayed: 6, cost: 232 },
  { month: "Apr", onTime: 91, delayed: 9, cost: 251 },
  { month: "May", onTime: 89, delayed: 11, cost: 278 },
  { month: "Jun", onTime: 95, delayed: 5, cost: 225 },
  { month: "Jul", onTime: 93, delayed: 7, cost: 238 },
  { month: "Aug", onTime: 90, delayed: 10, cost: 262 },
  { month: "Sep", onTime: 96, delayed: 4, cost: 218 },
  { month: "Oct", onTime: 94, delayed: 6, cost: 235 },
  { month: "Nov", onTime: 92, delayed: 8, cost: 248 },
  { month: "Dec", onTime: 95, delayed: 5, cost: 222 },
];

export function PerformanceChart() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-border/50 px-6 py-4">
        <h3 className="font-semibold text-foreground">Performance Overview</h3>
        <p className="text-sm text-muted-foreground">
          On-time delivery rate & cost trends
        </p>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 92%, 41%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(187, 92%, 41%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(222, 47%, 11%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(222, 47%, 11%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="onTime"
              stroke="hsl(187, 92%, 41%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOnTime)"
              name="On-Time %"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">On-Time Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-navy" />
            <span className="text-sm text-muted-foreground">Freight Cost Index</span>
          </div>
        </div>
      </div>
    </div>
  );
}
