import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { LaneWatchShell } from '@/components/lanewatch/LaneWatchShell';
import { MissingPanel, Panel, StatusPill } from '@/components/lanewatch/LaneWatchCommon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLaneWatch } from '@/hooks/useLaneWatch';
import { formatDate, formatDateTimeIST, formatTimeLabelIST, formatWindow } from '@/lib/lanewatch/exposure';

const CHANNEL_LABEL: Record<string, string> = { weather: 'WEATHER', official: 'OFFICIAL', social: 'SOCIAL', news: 'NEWS' };

export default function LaneWatchEvent() {
  const { code = '' } = useParams();
  const data = useLaneWatch();
  const event = data.events.find((row) => row.code.toUpperCase() === decodeURIComponent(code).toUpperCase());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  if (!event) return <LaneWatchShell title="Event" section="Alerts" context={code}><MissingPanel message="Event not found in LaneWatch" /></LaneWatchShell>;

  const verdict = data.verdicts.get(event.id);
  const exposure = data.exposures.get(event.id);
  if (!verdict || !exposure) return <LaneWatchShell title="Event" section="Alerts" context={event.code}><MissingPanel message="Event not found in LaneWatch" /></LaneWatchShell>;
  const signals = data.getSignalsFor(event.id);
  const shipmentRows = exposure.shipmentIds.map((id) => data.shipments.find((shipment) => shipment.id === id)).filter((shipment) => shipment !== undefined);
  const mayReview = data.user.role !== 'viewer' && verdict.corroborated && !event.review;
  const reviewEvent = () => {
    const result = data.reviewEvent(event.id, reviewNote.trim() || undefined);
    if (!result.ok) { toast.error('Could not mark this event as checked.'); return; }
    toast.success(`Event checked · new status ${result.verdict.status.replace('_', ' ')}`);
    setReviewOpen(false);
    setReviewNote('');
  };

  return <LaneWatchShell title={`Event · ${event.title}`} section="Alerts" context={event.code}>
    <section className={`border border-l-4 ${verdict.status === 'ACT_NOW' ? 'border-l-destructive' : 'border-l-warning'} border-border bg-card p-5`}><div className="flex flex-wrap items-center gap-3"><StatusPill status={verdict.status} />{event.escalatedAt && <span className="text-xs text-muted-foreground">Upgraded from Watch at {formatDateTimeIST(event.escalatedAt)}</span>}</div><h2 className="mt-3 text-xl font-semibold">{event.summary}</h2><p className="mt-2 text-sm text-muted-foreground">Affected window {formatWindow(event.affectedFrom, event.affectedTo)} (est.) · {exposure.counts.shipments} shipments · {exposure.counts.pos} POs · {exposure.counts.lanes} lanes</p></section>
    <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel title="Evidence trail" caption={`All times IST · ${formatDate(event.firstSignalAt)}`}>
        <ol className="space-y-3">{signals.map((signal) => <li key={signal.id} className={`grid grid-cols-[64px_14px_1fr] gap-3 ${signal.retractedAt ? 'opacity-45' : ''}`}><span className="pt-2 text-xs text-muted-foreground">{formatTimeLabelIST(signal.observedAt)}</span><span className={`mt-2 h-2.5 w-2.5 rounded-full ${signal.retractedAt ? 'bg-muted-foreground' : signal.authority === 'official' ? 'bg-success' : 'bg-warning'}`} /><div className="border border-border bg-background p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className={`text-[10px] font-semibold ${signal.channel === 'social' ? 'text-warning' : signal.channel === 'official' ? 'text-success' : 'text-primary'}`}>{CHANNEL_LABEL[signal.channel]}</span><span className="text-xs text-muted-foreground">{signal.sourceName}</span></div><p className={`mt-1 text-sm ${signal.retractedAt ? 'line-through' : ''}`}>{signal.headline}</p>{signal.retractedAt && <p className="mt-1 text-xs text-muted-foreground">Retracted {formatDateTimeIST(signal.retractedAt)}</p>}</div></li>)}</ol>
      </Panel>
      <div className="space-y-5">
        <Panel title="Validation rule"><div className="grid gap-3 md:grid-cols-2"><div className="border border-warning/30 bg-warning/5 p-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-warning-foreground"><CircleAlert className="h-4 w-4" />WATCH – UNCONFIRMED</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{verdict.watchPolicy.map((line) => <li key={line}>{line}</li>)}</ul></div><div className="border border-destructive/30 bg-destructive/5 p-3"><h3 className="flex items-center gap-2 text-sm font-semibold text-destructive"><Check className="h-4 w-4" />ACT NOW</h3><ul className="mt-2 space-y-1 text-xs text-muted-foreground">{verdict.actNowRule.map((rule) => <li key={rule}>{rule}</li>)}</ul>{verdict.status === 'ACT_NOW' ? <ul className="mt-2 space-y-1 text-xs">{verdict.reasons.map((reason) => <li key={reason} className="flex gap-1.5 text-success"><Check className="h-3.5 w-3.5 shrink-0" />{reason}</li>)}</ul> : <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{verdict.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>}</div></div>{mayReview && <Button className="mt-4" onClick={() => setReviewOpen(true)}>Mark as checked</Button>}</Panel>
        <Panel title="Affected shipments & POs"><div className="space-y-2">{shipmentRows.map((shipment) => { const rows = exposure.poExposures.filter((po) => shipment.linkedPoIds.includes(po.poId)); return <Link key={shipment.id} to={`/risk/${shipment.mode}/${encodeURIComponent(shipment.reference)}`} className="flex items-start justify-between gap-3 border border-border bg-background p-3 hover:bg-muted/40"><div className="min-w-0"><p className="font-semibold">{shipment.reference} <span className="font-normal text-muted-foreground">· {shipment.origin}</span></p><p className="mt-1 text-xs text-muted-foreground">{rows.map((row) => `${row.poNumber} · ${formatDate(row.needBy)}`).join(' · ') || 'No linked purchase orders'}</p></div><StatusPill status={verdict.status} compact /></Link>; })}</div></Panel>
      </div>
    </div>
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent><DialogHeader><DialogTitle>Mark event as checked</DialogTitle><DialogDescription>Record a note for the review history. Status remains determined by evidence and sign-off.</DialogDescription></DialogHeader><Textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Review note (optional)" /><DialogFooter><Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button><Button onClick={reviewEvent}>Confirm check</Button></DialogFooter></DialogContent></Dialog>
  </LaneWatchShell>;
}