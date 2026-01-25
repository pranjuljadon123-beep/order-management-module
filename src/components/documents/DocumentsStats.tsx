import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  XCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDocumentStats } from '@/hooks/useDocuments';
import { cn } from '@/lib/utils';

export function DocumentsStats() {
  const { data: stats, isLoading } = useDocumentStats();

  const statCards = [
    {
      label: 'Total Documents',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-accent',
    },
    {
      label: 'Drafts',
      value: stats?.draft || 0,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Pending Review',
      value: stats?.pending_review || 0,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning-light',
    },
    {
      label: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success-light',
    },
    {
      label: 'Submitted',
      value: stats?.submitted || 0,
      icon: Send,
      color: 'text-info',
      bgColor: 'bg-info-light',
    },
    {
      label: 'Validation Issues',
      value: stats?.validation_issues || 0,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
