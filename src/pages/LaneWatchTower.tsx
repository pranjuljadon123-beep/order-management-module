import { Link } from 'react-router-dom';
import { Plane, Ship, Wind } from 'lucide-react';
import { LaneWatchShell } from '@/components/lanewatch/LaneWatchShell';
import { Panel, StatusPill } from '@/components/lanewatch/LaneWatchCommon';
import { Badge } from '@/components/ui/badge';
import { useLaneWatch } from '@/hooks/useLaneWatch';
import { formatDate, formatFirstLinkedPo, formatTimeLabelIST, formatWindow, unverifiedSignalLabel } from '@/lib/lanewatch/exposure';

const PORTS = [
  { name: 'Hamburg', x: 88, y: 67 }, { name: 'Newark', x: 60, y: 115 }, { name: 'Shanghai', x: 420, y: 82 },
  { name: 'Mundra', x: 255, y: 185 }, { name: 'Nhava Sheva', x: 273, y: 209 },
  { name: 'BOM', x: 235, y: 230 }, { name: 'Jebel Ali / DXB', x: 315, y: 260 },
  { name: 'Colombo', x: 365, y: 305 }, { name: 'Singapore', x: 440, y: 340 }, { name: 'ORD', x: 85, y: 145 },
];

export default function LaneWatchTower() {
  const data = useLaneWatch();
  const { warnings, stats, touchedShipments } = data;
  const statRows = [
    { label: 'Shipments in transit', value: stats.inTransit, note: `${stats.ocean} ocean · ${stats.air} air` },
    { label: 'Tied to a live risk', value: stats.tiedToRisk, note: 'Ocean and air lanes in monitored zones' },
    { label: 'Act now (confirmed)', value: stats.actNow, note: 'At least 1 official or 2 news sources', tone: 'danger' },
    { label: 'Watch – unconfirmed', value: stats.watch, note: 'Social only, still validating', tone: 'warning' },
  ];
  const point = (name: string) => PORTS.find((port) => port.name.toLowerCase() === name.toLowerCase() || (name === 'DXB' && port.name === 'Jebel Ali / DXB'));
  const mapRoutes = data.shipments.map((shipment) => ({
    shipment,
    from: point(shipment.origin),
    via: shipment.via ? point(shipment.via) : undefined,
    to: point(shipment.destination),
  })).filter((row) => row.from && row.to);

  return <LaneWatchShell title="Control tower" section="Tower" context="All lanes">
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
      {statRows.map((item) => <div key={item.label} className="bg-card p-4"><p className="text-xs text-muted-foreground">{item.label}</p><p className={`mt-2 text-3xl font-semibold ${item.tone === 'danger' ? 'text-destructive' : item.tone === 'warning' ? 'text-warning' : ''}`}>{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.note}</p></div>)}
      <div className="bg-card p-4"><p className="text-xs text-muted-foreground">Signals scanned (24h)</p><div className="mt-2 flex flex-wrap gap-1.5">{[
        ['Weather', stats.sourceMix.weather], ['Official', stats.sourceMix.official], ['Social', stats.sourceMix.social], ['News', stats.sourceMix.news],
      ].map(([name, count]) => <Badge key={name} variant="secondary" className="font-medium">{name} · {count}</Badge>)}</div><p className="mt-2 text-xs text-muted-foreground">IMD · NOAA · GDACS · ports · X</p></div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel title="Lanes & live risk zones" caption="Schematic map · not to scale">
        <svg viewBox="0 0 520 390" role="img" aria-label="Schematic map showing monitored lanes and risk zones" className="h-auto max-h-[420px] w-full rounded-sm bg-muted/30">
          <path d="M30 92 Q175 7 250 92 T485 74 M45 300 Q140 220 230 265 T470 355" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 7" />
          {mapRoutes.map(({ shipment, from, via, to }) => <path key={shipment.id} d={via ? `M ${from?.x} ${from?.y} Q ${(Number(from?.x) + Number(via.x)) / 2} ${Math.min(Number(from?.y), Number(via.y)) - 25} ${via.x} ${via.y} Q ${(Number(via.x) + Number(to?.x)) / 2} ${Math.min(Number(via.y), Number(to?.y)) - 25} ${to?.x} ${to?.y}` : `M ${from?.x} ${from?.y} Q ${(Number(from?.x) + Number(to?.x)) / 2} ${Math.min(Number(from?.y), Number(to?.y)) - 45} ${to?.x} ${to?.y}`} fill="none" stroke="hsl(var(--primary))" strokeOpacity={shipment.mode === 'ocean' ? 0.7 : 0.45} strokeWidth={shipment.mode === 'ocean' ? 3 : 1.5} strokeDasharray={shipment.mode === 'air' ? '5 5' : undefined} />)}
          {warnings.map(({ event, verdict }) => PORTS.filter((port) => event.geographies.some((geo) => geo.toLowerCase() === port.name.toLowerCase())).map((port) => <circle key={`${event.id}-${port.name}`} cx={port.x} cy={port.y} r="18" fill={verdict.status === 'ACT_NOW' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'} fillOpacity=".14" stroke={verdict.status === 'ACT_NOW' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'} strokeOpacity=".35" />))}
          {PORTS.map((port) => <g key={port.name}><circle cx={port.x} cy={port.y} r="4" fill="hsl(var(--foreground))" /><text x={port.x + 7} y={port.y + 4} fill="hsl(var(--muted-foreground))" fontSize="10">{port.name}</text></g>)}
          <rect x="155" y="9" width="210" height="25" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
          <text x="165" y="25" fill="hsl(var(--muted-foreground))" fontSize="10">To USA (Newark, ORD) via Jebel Ali / Colombo</text>
        </svg>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Ship className="h-3.5 w-3.5 text-primary" /> Ocean lane</span><span className="flex items-center gap-2"><Plane className="h-3.5 w-3.5 text-primary" /> Air lane</span><span className="flex items-center gap-2"><Wind className="h-3.5 w-3.5 text-destructive" /> Act now zone</span><span className="flex items-center gap-2"><Wind className="h-3.5 w-3.5 text-warning" /> Watch zone</span></div>
      </Panel>
      <Panel title="Early warnings" caption="Sorted by first signal">
        <div className="space-y-2">
          {warnings.map(({ event, verdict }) => {
            const exposure = data.exposures.get(event.id);
            const signals = data.getSignalsFor(event.id);
            return <Link key={event.id} to={`/risk/event/${encodeURIComponent(event.code)}`} className={`block border-l-2 ${verdict.status === 'ACT_NOW' ? 'border-l-destructive' : 'border-l-warning'} border-y border-r border-border bg-background p-3 transition-colors hover:bg-muted/40`}>
              <div className="flex flex-wrap items-start justify-between gap-2"><StatusPill status={verdict.status} /><div className="text-right text-[11px] text-muted-foreground">First signal {formatTimeLabelIST(event.firstSignalAt)}{event.escalatedAt ? <div>Confirmed {formatTimeLabelIST(event.escalatedAt)}</div> : <div>social only</div>}</div></div>
              <h3 className="mt-2 font-semibold">{event.title}</h3><p className="mt-1 text-xs text-muted-foreground">{verdict.status === 'ACT_NOW' ? `${verdict.reasons.join(' · ')} · ${exposure?.counts.shipments ?? 0} shipments, ${exposure?.counts.pos ?? 0} POs` : unverifiedSignalLabel(signals.length)}</p>
            </Link>;
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Signals are tied to your lanes and POs before alerting.</p>
      </Panel>
    </div>

    <Panel title="Shipments touching an active warning" caption={`${touchedShipments.length} of ${stats.inTransit}`}>
      <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead><tr className="border-b border-border text-[11px] uppercase text-muted-foreground">{['Shipment', 'Mode', 'Lane', 'PO', 'Original ETA', 'Revised window', 'Risk'].map((head) => <th key={head} className="px-3 py-2 font-medium">{head}</th>)}</tr></thead><tbody>{touchedShipments.map(({ shipment, event, verdict }) => {
        const poRows = data.exposures.get(event.id)?.poExposures.filter((po) => shipment.linkedPoIds.some((id) => id === po.poId)) ?? [];
        const first = poRows[0];
        return <tr key={`${event.id}-${shipment.id}`} className="border-b border-border/70 hover:bg-muted/40"><td className="px-3 py-3 font-medium"><Link className="text-primary underline-offset-4 hover:underline" to={`/risk/${shipment.mode}/${encodeURIComponent(shipment.reference)}`}>{shipment.reference}</Link></td><td className="px-3 py-3 capitalize">{shipment.mode}</td><td className="px-3 py-3">{shipment.lane}</td><td className="px-3 py-3">{formatFirstLinkedPo(poRows)}</td><td className="px-3 py-3">{formatDate(shipment.plannedArrival)}</td><td className="px-3 py-3">{shipment.revisedArrivalFrom || shipment.revisedArrivalTo ? `${formatWindow(shipment.revisedArrivalFrom, shipment.revisedArrivalTo)}${shipment.arrivalProvenance === 'lanewatch_estimate' ? ' (est.)' : ''}` : verdict.status === 'WATCH' ? 'Watch' : '—'}</td><td className="px-3 py-3"><StatusPill status={verdict.status} compact /></td></tr>;
      })}</tbody></table></div>
    </Panel>
  </LaneWatchShell>;
}