import { Sparkles, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IncidentAlertProps {
  title: string;
  date: string;
  impactedCount: number;
  current: number;
  total: number;
}

export function IncidentAlert({ 
  title = "Severe Winter Storm Hits UK Shipping, Sends Containers Overboard",
  date = "10 Jan 2026",
  impactedCount = 86,
  current = 1,
  total = 1
}: Partial<IncidentAlertProps>) {
  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
      <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white gap-1 px-3 py-1">
        <Sparkles className="h-3 w-3" />
        Incident Lens
        <Sparkles className="h-3 w-3" />
      </Badge>

      <p className="flex-1 text-sm text-foreground font-medium">
        {title}
      </p>

      <span className="text-sm text-muted-foreground">{date}</span>

      <Button variant="default" size="sm" className="gap-2">
        See {impactedCount} impacted container(s)
        <ExternalLink className="h-3 w-3" />
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span>({current}/{total})</span>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
