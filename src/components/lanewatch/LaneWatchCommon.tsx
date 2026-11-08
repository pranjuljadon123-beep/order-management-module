import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, Clock3, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { EventStatus, EventVerdict, LaneWatchShipment, PoExposure } from '@/types/lanewatch';
import { formatDate, formatWindow } from '@/lib/lanewatch/exposure';

export function Panel({ title, caption, children, className = '' }: { title: string; caption?: string; children: ReactNode; className?: string }) {
  return <section className={`min-w-0 border border-border bg-card ${className}`}><div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3"><div><h2 className="text-base font-semibold">{title}</h2>{caption && <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>}</div></div><div className="p-4">{children}</div></section>;
}

export function StatusPill({ status, compact = false }: { status: EventStatus; compact?: boolean }) {
  return <Badge variant="outline" className={status === 'ACT_NOW' ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-warning/40 bg-warning/10 text-warning'}>{status === 'ACT_NOW' ? 'ACT NOW' : compact ? 'WATCH' : 'WATCH – UNCONFIRMED'}</Badge>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0"><dt className="text-[11px] font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{children}</dd></div>;
}

export function MilestoneTimeline({ milestones }: { milestones: LaneWatchShipment['milestones'] }) {
  return <ol className="grid min-w-[620px] grid-flow-col auto-cols-[minmax(112px,1fr)] gap-3 overflow-x-auto pb-2">
    {milestones.map((milestone, index) => {
      const revised = milestone.estimatedFrom || milestone.actualAt;
      const Icon = milestone.state === 'done' ? Check : milestone.state === 'held' ? PauseCircle : milestone.state === 'active' ? Clock3 : Circle;
      const marker = milestone.state === 'done' ? 'text-success' : milestone.state === 'held' ? 'text-warning' : milestone.state === 'active' ? 'text-warning' : 'text-muted-foreground';
      return <li key={milestone.key} className="relative min-w-0 pr-2">
        {index < milestones.length - 1 && <span className="absolute left-6 top-[3.15rem] h-px w-full bg-border" />}
        <p className="min-h-8 text-xs font-semibold">{milestone.label}</p>
        <Icon className={`relative z-10 mb-2 h-5 w-5 rounded-full bg-card ${marker}`} />
        <p className="text-xs text-muted-foreground">Plan {formatDate(milestone.plannedAt)}</p>
        {revised && <p className={`mt-1 text-xs font-medium ${milestone.state === 'held' || milestone.estimatedFrom ? 'text-warning' : 'text-foreground'}`}>{milestone.state === 'held' || milestone.estimatedFrom ? <><s className="mr-1 text-muted-foreground">{formatDate(milestone.plannedAt)}</s>{formatWindow(milestone.estimatedFrom ?? milestone.actualAt, milestone.estimatedTo ?? milestone.actualAt)}</> : `Actual ${formatDate(revised)}`}</p>}
      </li>;
    })}
  </ol>;
}

export function ExposureTable({ rows }: { rows: PoExposure[] }) {
  if (!rows.length) return <p className="py-4 text-sm text-muted-foreground">No linked purchase orders.</p>;
  return <Table><TableHeader><TableRow><TableHead>PO</TableHead><TableHead>Item</TableHead><TableHead>Need-by</TableHead><TableHead>Buffer</TableHead><TableHead>Revised arrival</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
    {rows.map((row) => <TableRow key={row.poId}><TableCell className="font-medium">{row.poNumber}</TableCell><TableCell>{row.item}</TableCell><TableCell>{formatDate(row.needBy)}</TableCell><TableCell>{row.slackDays === null ? '—' : `${row.slackDays} days`}</TableCell><TableCell>{formatWindow(row.revisedArrivalFrom, row.revisedArrivalTo)}</TableCell><TableCell><Tooltip><TooltipTrigger asChild><span tabIndex={0} className={`cursor-help font-medium ${row.status === 'AT_RISK' ? 'text-destructive' : row.status === 'TIGHT' ? 'text-warning' : 'text-success'}`}>{row.status.replace('_', ' ')}</span></TooltipTrigger><TooltipContent>{row.rationale}</TooltipContent></Tooltip></TableCell></TableRow>)}
  </TableBody></Table>;
}

export function MissingPanel({ message }: { message: string }) {
  return <div className="border border-border bg-card p-8 text-sm text-muted-foreground">{message}</div>;
}

export function ShipmentLink({ shipment, children }: { shipment: LaneWatchShipment; children: ReactNode }) {
  return <Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/risk/${shipment.mode}/${encodeURIComponent(shipment.reference)}`}>{children}</Link>;
}

export function VerdictEvidence({ verdict }: { verdict: EventVerdict }) {
  return <p className="text-xs text-muted-foreground">{verdict.status === 'ACT_NOW' ? verdict.reasons.join(' · ') : verdict.blockers.join(' · ')}</p>;
}