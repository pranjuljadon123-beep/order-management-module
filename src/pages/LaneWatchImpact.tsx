import { useState } from 'react';
import { ChevronRight, Check, CircleAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LaneWatchShell } from '@/components/lanewatch/LaneWatchShell';
import { MissingPanel, Panel, StatusPill } from '@/components/lanewatch/LaneWatchCommon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLaneWatch } from '@/hooks/useLaneWatch';
import { earliestEventCutoff, formatDate, formatTimeLabelIST, formatWindow } from '@/lib/lanewatch/exposure';
import type { DecisionOption } from '@/types/lanewatch';

export default function LaneWatchImpact() {
  const { code = '' } = useParams();
  const data = useLaneWatch();
  const event = data.events.find((row) => row.code.toUpperCase() === decodeURIComponent(code).toUpperCase());
  const [activeOption, setActiveOption] = useState<DecisionOption | null>(null);
  const [reason, setReason] = useState('');
  if (!event) return <LaneWatchShell title="From early signal to business decision" section="Impact" context={code}><MissingPanel message="Event not found in LaneWatch" /></LaneWatchShell>;

  const verdict = data.verdicts.get(event.id);
  const exposure = data.exposures.get(event.id);
  if (!verdict || !exposure) return <LaneWatchShell title="From early signal to business decision" section="Impact" context={event.code}><MissingPanel message="Event not found in LaneWatch" /></LaneWatchShell>;
  const decisionGate = data.getDecisionOptions(event.id);
  const eventShipments = exposure.shipmentIds.map((id) => data.shipments.find((shipment) => shipment.id === id)).filter((shipment) => shipment !== undefined);
  const sourceNames = verdict.reasons.join(' · ');
  const shipmentNames = eventShipments.map((shipment) => shipment.transportDoc).join(', ') || 'No affected shipments';
  const poNames = exposure.poExposures.map((row) => row.poNumber).join(', ') || 'No linked POs';
  const revisedDeparture = eventShipments.map((shipment) => shipment.milestones.find((milestone) => milestone.key === 'etd')?.estimatedFrom).find(Boolean);
  const submitDecision = () => {
    if (!activeOption) return;
    if (!reason.trim()) { toast.error('Add a reason before saving this choice.'); return; }
    const result = data.recordDecision(event.id, activeOption.key, reason.trim());
    if (!result.ok) { toast.error(result.error ?? 'Decision could not be saved.'); return; }
    toast.success('Decision and reason saved for review.');
    setActiveOption(null);
    setReason('');
  };

  return <LaneWatchShell title="From early signal to business decision" section="Impact" context={event.code}>
    <div className="grid items-stretch gap-3 xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <Panel title="1 Early signal"><div className="space-y-3"><StatusPill status={verdict.status} /><h3 className="font-semibold">{event.title}</h3><dl className="space-y-1.5 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">First signal</dt><dd>{formatTimeLabelIST(event.firstSignalAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Confirmed</dt><dd>{event.escalatedAt ? formatTimeLabelIST(event.escalatedAt) : 'Not confirmed'}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Window</dt><dd className="text-right">{formatWindow(event.affectedFrom, event.affectedTo)} (est.)</dd></div></dl><div><p className="text-xs text-muted-foreground">Alert as sent (WhatsApp / email)</p><div className="mt-2 space-y-2 border border-border bg-muted/40 p-3 text-sm"><p className="font-semibold">{event.title}</p><p>{exposure.counts.shipments} shipments ({shipmentNames}) · {exposure.counts.pos} POs ({poNames}) · {exposure.counts.lanes} lanes</p><p>Revised ETD: {formatDate(revisedDeparture)}</p><p className="text-xs text-muted-foreground">Sources: {sourceNames || verdict.blockers.join(' · ')}</p><p className="text-xs text-muted-foreground">Reply 1 = details, 2 = mute</p></div><p className="mt-2 text-xs text-muted-foreground">Concept alert format — not a live channel.</p></div></div></Panel>
      <div className="hidden items-center justify-center text-muted-foreground xl:flex"><ChevronRight className="h-5 w-5" /></div>
      <Panel title="2 Affected orders"><div className="space-y-2">{exposure.poExposures.map((row) => <div key={row.poId} className="border border-border bg-background p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{row.poNumber}</p><p className="mt-1 text-sm text-muted-foreground">{row.item} · {data.purchaseOrders.find((po) => po.id === row.poId)?.quantity ?? ''}</p></div><StatusPill status={verdict.status} compact /></div><div className="mt-3 flex justify-between gap-2 text-xs"><span>Need-by {formatDate(row.needBy)}</span><span className={row.status === 'AT_RISK' ? 'text-destructive' : row.status === 'TIGHT' ? 'text-warning' : 'text-success'}>Arrival {formatWindow(row.revisedArrivalFrom, row.revisedArrivalTo)}</span></div></div>)}</div><p className="mt-3 text-xs text-muted-foreground">Line-stoppage exposure: {exposure.poExposures[0]?.rationale ?? 'No PO delay calculated.'}</p></Panel>
      <div className="hidden items-center justify-center text-muted-foreground xl:flex"><ChevronRight className="h-5 w-5" /></div>
      <Panel title="3 Decision options">
        {!decisionGate.allowed ? <div className="flex gap-2 border border-border bg-muted/30 p-3 text-sm text-muted-foreground"><CircleAlert className="h-4 w-4 shrink-0" />{decisionGate.reason}</div> : <><div className="space-y-2">{decisionGate.options.map((option) => <Button key={option.key} type="button" variant="outline" onClick={() => setActiveOption(option)} className="h-auto w-full items-start justify-start whitespace-normal p-3 text-left"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold">{option.key}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{option.title}</span><span className="mt-1 block text-sm font-normal text-muted-foreground">{option.detail}</span><span className="mt-2 inline-flex border border-border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">{option.tradeoff}</span></span></Button>)}</div><p className="mt-3 text-xs text-muted-foreground">LaneWatch suggests; your team decides and books.</p><p className="text-xs text-muted-foreground">No automatic rerouting or rebooking.</p></>}
      </Panel>
    </div>

    <section className="grid gap-4 border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-xs text-muted-foreground">Decision owner</p><p className="mt-1 text-sm font-medium">{data.user.name}</p></div><div><p className="text-xs text-muted-foreground">Decide by</p><p className="mt-1 text-sm font-medium">{formatDate(earliestEventCutoff(data.events))}</p></div><div><p className="text-xs text-muted-foreground">Next update</p><p className="mt-1 text-sm font-medium">Every 3 h or on new official source</p></div><div><p className="text-xs text-muted-foreground">Log</p><p className="mt-1 text-sm font-medium">Choice + reason saved for review</p></div></section>

    <Dialog open={Boolean(activeOption)} onOpenChange={(open) => { if (!open) { setActiveOption(null); setReason(''); } }}><DialogContent><DialogHeader><DialogTitle>Record decision</DialogTitle><DialogDescription>{activeOption?.title}. Add a reason to save this choice for review.</DialogDescription></DialogHeader><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for this decision" /><DialogFooter><Button variant="outline" onClick={() => setActiveOption(null)}>Cancel</Button><Button onClick={submitDecision}><Check className="h-4 w-4" />Save decision</Button></DialogFooter></DialogContent></Dialog>
  </LaneWatchShell>;
}