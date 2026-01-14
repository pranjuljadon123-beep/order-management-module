import { Sparkles, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Incident } from "@/hooks/useTracking";

interface IncidentAlertProps {
  incidents: Incident[];
  onViewImpacted: (incident: Incident) => void;
  onDismiss: (incidentId: string) => void;
}

export function IncidentAlert({ 
  incidents,
  onViewImpacted,
  onDismiss,
}: IncidentAlertProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const unreadIncidents = incidents.filter(i => !i.isRead);
  
  if (unreadIncidents.length === 0) return null;
  
  // Ensure currentIndex is within bounds
  const safeIndex = Math.min(currentIndex, unreadIncidents.length - 1);
  const currentIncident = unreadIncidents[safeIndex];
  const total = unreadIncidents.length;

  // Extra safety check
  if (!currentIncident) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-card border border-border rounded-lg px-3 sm:px-4 py-3 relative">
      <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white gap-1 px-2 sm:px-3 py-1 flex-shrink-0">
        <Sparkles className="h-3 w-3 hidden sm:block" />
        <span className="text-xs sm:text-sm">Incident Lens</span>
        <Sparkles className="h-3 w-3 hidden sm:block" />
      </Badge>

      <p className="flex-1 text-xs sm:text-sm text-foreground font-medium line-clamp-1">
        {currentIncident.title}
      </p>

      <span className="text-xs sm:text-sm text-muted-foreground hidden md:block flex-shrink-0">
        {currentIncident.date}
      </span>

      <Button 
        variant="default" 
        size="sm" 
        className="gap-1 sm:gap-2 flex-shrink-0"
        onClick={() => onViewImpacted(currentIncident)}
      >
        <span className="hidden sm:inline">See {currentIncident.impactedCount} impacted container(s)</span>
        <span className="sm:hidden">{currentIncident.impactedCount}</span>
        <ExternalLink className="h-3 w-3" />
      </Button>

      {total > 1 && (
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 sm:h-7 sm:w-7"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <span>({currentIndex + 1}/{total})</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 sm:h-7 sm:w-7"
            onClick={goToNext}
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0"
        onClick={() => onDismiss(currentIncident.id)}
      >
        <X className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
