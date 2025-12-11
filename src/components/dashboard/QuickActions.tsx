import { Plus, FileSearch, Calculator, Send, Upload, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "New Shipment", variant: "default" as const },
  { icon: FileSearch, label: "Track", variant: "outline" as const },
  { icon: Calculator, label: "Get Quote", variant: "outline" as const },
  { icon: Send, label: "Send RFQ", variant: "outline" as const },
  { icon: Upload, label: "Upload Docs", variant: "outline" as const },
  { icon: RefreshCcw, label: "Sync Data", variant: "outline" as const },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action, index) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          className={`gap-2 animate-fade-in ${
            action.variant === "default"
              ? "bg-accent hover:bg-accent/90 text-accent-foreground"
              : ""
          }`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
