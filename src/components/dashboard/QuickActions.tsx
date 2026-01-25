import { Plus, FileSearch, Calculator, Send, Upload, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (label: string) => {
    switch (label) {
      case "New Shipment":
        navigate("/tracking");
        toast.info("Navigate to Tracking to add a new shipment");
        break;
      case "Track":
        navigate("/tracking");
        break;
      case "Get Quote":
        navigate("/procurement");
        toast.info("Start a new RFQ to get quotes from vendors");
        break;
      case "Send RFQ":
        navigate("/procurement");
        break;
      case "Upload Docs":
        navigate("/documents");
        break;
      case "Sync Data":
        toast.success("Data sync initiated", { description: "Syncing with external systems..." });
        break;
      default:
        break;
    }
  };

  const actions = [
    { icon: Plus, label: "New Shipment", variant: "default" as const },
    { icon: FileSearch, label: "Track", variant: "outline" as const },
    { icon: Calculator, label: "Get Quote", variant: "outline" as const },
    { icon: Send, label: "Send RFQ", variant: "outline" as const },
    { icon: Upload, label: "Upload Docs", variant: "outline" as const },
    { icon: RefreshCcw, label: "Sync Data", variant: "outline" as const },
  ];

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
          onClick={() => handleAction(action.label)}
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
