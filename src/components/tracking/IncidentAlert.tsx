import { 
  Sparkles, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  CloudRain, 
  Crosshair, 
  Ship, 
  Users, 
  Globe, 
  Construction, 
  Skull,
  HeartPulse,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { Incident, IncidentCategory, IncidentSeverity } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

interface IncidentAlertProps {
  incidents: Incident[];
  onViewImpacted: (incident: Incident) => void;
  onDismiss: (incidentId: string) => void;
}

const categoryIcons: Record<IncidentCategory, React.ReactNode> = {
  weather: <CloudRain className="h-4 w-4" />,
  conflict: <Crosshair className="h-4 w-4" />,
  "port-congestion": <Ship className="h-4 w-4" />,
  "labor-strike": <Users className="h-4 w-4" />,
  geopolitical: <Globe className="h-4 w-4" />,
  infrastructure: <Construction className="h-4 w-4" />,
  piracy: <Skull className="h-4 w-4" />,
  pandemic: <HeartPulse className="h-4 w-4" />,
};

const categoryLabels: Record<IncidentCategory, string> = {
  weather: "Weather",
  conflict: "Conflict",
  "port-congestion": "Port Congestion",
  "labor-strike": "Labor Strike",
  geopolitical: "Geopolitical",
  infrastructure: "Infrastructure",
  piracy: "Piracy",
  pandemic: "Pandemic",
};

const severityStyles: Record<IncidentSeverity, string> = {
  critical: "bg-destructive text-destructive-foreground animate-pulse",
  high: "bg-orange-500 text-white",
  medium: "bg-warning text-warning-foreground",
  low: "bg-muted text-muted-foreground",
};

const severityBorderStyles: Record<IncidentSeverity, string> = {
  critical: "border-destructive/50 bg-destructive/5",
  high: "border-orange-500/50 bg-orange-500/5",
  medium: "border-warning/50 bg-warning/5",
  low: "border-border bg-card",
};

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
    <div className={cn(
      "rounded-lg border-2 overflow-hidden transition-all",
      severityBorderStyles[currentIncident.severity]
    )}>
      {/* Header with category and severity */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-destructive/10 to-orange-500/10 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            <span className="text-sm font-semibold">Incident Lens</span>
            <AlertTriangle className="h-3 w-3" />
          </Badge>
          
          <Badge variant="outline" className="gap-1.5 text-xs">
            {categoryIcons[currentIncident.category]}
            {categoryLabels[currentIncident.category]}
          </Badge>
          
          <Badge className={cn("text-xs uppercase font-bold", severityStyles[currentIncident.severity])}>
            {currentIncident.severity}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {currentIncident.estimatedDelayDays && currentIncident.estimatedDelayDays > 0 && (
            <Badge variant="outline" className="gap-1 text-xs text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800">
              <Clock className="h-3 w-3" />
              +{currentIncident.estimatedDelayDays} days delay
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground hidden sm:block">
            {currentIncident.date}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            currentIncident.severity === "critical" ? "bg-destructive/20 text-destructive" :
            currentIncident.severity === "high" ? "bg-orange-500/20 text-orange-600" :
            "bg-warning/20 text-warning-foreground"
          )}>
            {categoryIcons[currentIncident.category]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">
              {currentIncident.title}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
              {currentIncident.description}
            </p>
            
            {/* Affected regions/ports */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentIncident.affectedPorts.slice(0, 4).map((port) => (
                <Badge key={port} variant="secondary" className="text-xs py-0">
                  {port}
                </Badge>
              ))}
              {currentIncident.affectedPorts.length > 4 && (
                <Badge variant="secondary" className="text-xs py-0">
                  +{currentIncident.affectedPorts.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1.5"
              onClick={() => onViewImpacted(currentIncident)}
            >
              <span className="hidden sm:inline">See {currentIncident.impactedCount} impacted</span>
              <span className="sm:hidden">{currentIncident.impactedCount}</span>
              <ExternalLink className="h-3 w-3" />
            </Button>

            {currentIncident.sourceUrl && (
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 hidden md:flex"
                onClick={() => window.open(currentIncident.sourceUrl, '_blank')}
              >
                <span className="text-xs">{currentIncident.source}</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer with navigation */}
      {total > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t border-border/50">
          <div className="flex items-center gap-2">
            {unreadIncidents.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === safeIndex 
                    ? "bg-primary w-4" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">
              {safeIndex + 1} of {total} active alerts
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-1"
              onClick={() => onDismiss(currentIncident.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Single incident dismiss button */}
      {total === 1 && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDismiss(currentIncident.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}