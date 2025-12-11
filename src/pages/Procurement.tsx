import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingDown, Users, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const rfqs = [
  {
    id: "RFQ-2024-089",
    lane: "Shanghai → Los Angeles",
    mode: "Ocean FCL",
    volume: "40 TEUs",
    deadline: "Dec 15, 2024",
    bids: 5,
    status: "active",
    bestRate: "$2,450",
  },
  {
    id: "RFQ-2024-088",
    lane: "Frankfurt → Singapore",
    mode: "Air Freight",
    volume: "2,500 kg",
    deadline: "Dec 12, 2024",
    bids: 8,
    status: "active",
    bestRate: "$4.20/kg",
  },
  {
    id: "RFQ-2024-087",
    lane: "Mumbai → Dubai",
    mode: "Ocean LCL",
    volume: "15 CBM",
    deadline: "Dec 10, 2024",
    bids: 6,
    status: "closing",
    bestRate: "$85/CBM",
  },
  {
    id: "RFQ-2024-086",
    lane: "Chicago → Toronto",
    mode: "Road FTL",
    volume: "Full Truck",
    deadline: "Dec 8, 2024",
    bids: 4,
    status: "awarded",
    bestRate: "$1,850",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return { bg: "bg-cyan-light text-accent", icon: Clock };
    case "closing":
      return { bg: "bg-warning-light text-warning", icon: AlertCircle };
    case "awarded":
      return { bg: "bg-success-light text-success", icon: CheckCircle2 };
    default:
      return { bg: "bg-secondary text-muted-foreground", icon: FileText };
  }
};

const Procurement = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Freight Procurement
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create RFQs, compare rates, and award contracts
            </p>
          </div>
          <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4" />
            New RFQ
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="kpi-card bg-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-light">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active RFQs</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>
        <div className="kpi-card bg-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-light">
              <TrendingDown className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Savings</p>
              <p className="text-2xl font-bold text-foreground">8.5%</p>
            </div>
          </div>
        </div>
        <div className="kpi-card bg-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info-light">
              <Users className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Carriers</p>
              <p className="text-2xl font-bold text-foreground">48</p>
            </div>
          </div>
        </div>
        <div className="kpi-card bg-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-light">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Awards</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="border-b border-border/50 px-6 py-4">
          <h3 className="font-semibold text-foreground">Recent RFQs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>RFQ ID</th>
                <th>Lane</th>
                <th>Mode</th>
                <th>Volume</th>
                <th>Deadline</th>
                <th>Bids</th>
                <th>Best Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq, index) => {
                const statusInfo = getStatusBadge(rfq.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <tr
                    key={rfq.id}
                    className="animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="font-medium text-foreground">{rfq.id}</td>
                    <td className="text-foreground">{rfq.lane}</td>
                    <td className="text-foreground">{rfq.mode}</td>
                    <td className="text-foreground">{rfq.volume}</td>
                    <td className="text-foreground">{rfq.deadline}</td>
                    <td>
                      <span className="font-semibold text-accent">{rfq.bids}</span>
                    </td>
                    <td className="font-medium text-success">{rfq.bestRate}</td>
                    <td>
                      <span className={cn("status-badge capitalize", statusInfo.bg)}>
                        <StatusIcon className="h-3 w-3" />
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Procurement;
