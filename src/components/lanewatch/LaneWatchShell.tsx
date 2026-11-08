import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { useLaneWatch } from '@/hooks/useLaneWatch';
import { DEMO_NOTICE } from '@/mock/lanewatchSeed';
import { cn } from '@/lib/utils';
import { useAiContext } from '@/hooks/useAiContext';

interface LaneWatchShellProps {
  title: string;
  section: string;
  context: string;
  children: ReactNode;
}

export function LaneWatchShell({ title, section, context, children }: LaneWatchShellProps) {
  const data = useLaneWatch();
  const { touchedShipments, warnings } = data;
  const navigate = useNavigate();
  const location = useLocation();
  useAiContext('lanewatch', { warnings, stats: data.stats, touchedShipments }, {
    openEvent: (code: string) => navigate(`/risk/event/${encodeURIComponent(code)}`),
    openShipment: (reference: string) => {
      const row = data.touchedShipments.find((item) => item.shipment.reference === reference);
      if (row) navigate(`/risk/${row.shipment.mode}/${encodeURIComponent(row.shipment.reference)}`);
    },
  });
  const ocean = touchedShipments.find((row) => row.shipment.mode === 'ocean')?.shipment;
  const air = touchedShipments.find((row) => row.shipment.mode === 'air')?.shipment;
  const event = warnings.find((row) => row.verdict.status === 'ACT_NOW')?.event;
  const links = [
    { label: 'Tower', to: '/risk' },
    { label: 'Ocean', to: ocean ? `/risk/ocean/${encodeURIComponent(ocean.reference)}` : undefined },
    { label: 'Air', to: air ? `/risk/air/${encodeURIComponent(air.reference)}` : undefined },
    { label: 'Alerts', to: event ? `/risk/event/${encodeURIComponent(event.code)}` : undefined },
    { label: 'Impact', to: event ? `/risk/impact/${encodeURIComponent(event.code)}` : undefined },
  ];

  return (
    <AppLayout>
      <div className="-mx-6 -mt-6 min-h-[calc(100vh-4rem)] bg-background text-foreground dark">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col sm:flex-row">
          <aside className="w-full shrink-0 border-b border-border bg-card/40 py-2 sm:w-20 sm:border-b-0 sm:border-r sm:py-7">
            <nav aria-label="LaneWatch sections" className="flex items-center justify-around gap-1 overflow-x-auto sm:flex-col sm:justify-start sm:gap-5">
              {links.map((item) => {
                const active = item.to === '/risk'
                  ? location.pathname === '/risk'
                  : Boolean(item.to && location.pathname.startsWith(item.to.split('/').slice(0, 3).join('/')));
                const content = <><span className={cn('h-2.5 w-2.5 rounded-full', active ? 'bg-primary ring-4 ring-primary/15' : 'bg-muted-foreground/40')} /><span>{item.label}</span></>;
                return item.to ? (
                  <Link key={item.label} to={item.to} aria-current={active ? 'page' : undefined} className={cn('flex min-h-14 w-full flex-col items-center justify-center gap-2 text-[11px] font-medium transition-colors', active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                    {content}
                  </Link>
                ) : (
                  <span key={item.label} aria-disabled="true" className="flex min-h-14 w-full flex-col items-center justify-center gap-2 text-[11px] text-muted-foreground/40">{content}</span>
                );
              })}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-7 lg:px-9">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="min-w-0">
                  <p className="mb-1 text-xs text-muted-foreground">LaneWatch <span className="px-1">/</span> {section} <span className="px-1">·</span> {context}</p>
                  <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
                </div>
                <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning-foreground">Illustrative demo data · Concept design</Badge>
              </div>
              <div className="space-y-5">{children}</div>
              <footer className="mt-8 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">{DEMO_NOTICE}</footer>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}