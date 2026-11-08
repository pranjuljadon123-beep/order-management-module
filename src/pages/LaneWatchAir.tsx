import { useParams } from 'react-router-dom';
import { LaneWatchShell } from '@/components/lanewatch/LaneWatchShell';
import { ExposureTable, Field, MissingPanel, MilestoneTimeline, Panel, StatusPill } from '@/components/lanewatch/LaneWatchCommon';
import { useLaneWatch } from '@/hooks/useLaneWatch';
import { connectionSegmentPercentages, formatDate, formatWindow } from '@/lib/lanewatch/exposure';

export default function LaneWatchAir() {
  const { reference = '' } = useParams();
  const data = useLaneWatch();
  const shipment = data.getShipment(decodeURIComponent(reference));
  if (!shipment || shipment.mode !== 'air') return <LaneWatchShell title="Air visibility" section="Air" context="Shipment lookup"><MissingPanel message="Shipment not found in LaneWatch" /></LaneWatchShell>;
  const warning = data.warnings.find(({ event }) => data.exposures.get(event.id)?.shipmentIds.includes(shipment.id));
  const exposure = warning ? data.exposures.get(warning.event.id) : undefined;
  const poRows = exposure?.poExposures.filter((po) => shipment.linkedPoIds.includes(po.poId)) ?? [];
  const connection = shipment.connection;
  const signal = warning?.event && data.getSignalsFor(warning.event.id).find((row) => row.id === connection?.validationSignalId);
  const share = connection ? connectionSegmentPercentages([connection.bufferMinutes, connection.slowdownMinutes, connection.overrunMinutes]) : [];

  return <LaneWatchShell title={`Air visibility · ${shipment.reference}`} section="Air" context={`AWB ${shipment.transportDoc}`}>
    <section className="border border-border bg-card p-4"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Field label="AWB">{shipment.transportDoc}</Field><Field label="Routing">{shipment.lane}</Field><Field label="Flights">{shipment.vesselOrFlight}</Field><Field label="Cargo">{shipment.cargo}</Field><Field label="Pieces / weight">{shipment.equipment ?? 'Not recorded'}</Field></div><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">{warning ? <StatusPill status={warning.verdict.status} /> : <span className="text-sm text-muted-foreground">No linked warning</span>}{warning && <span className="text-sm">· {warning.event.title}</span>}<span className="ml-auto text-xs text-muted-foreground">Milestones: airline/forwarder status (concept)</span></div></section>
    <Panel title="AWB milestones (Cargo-IMP style)" caption="Times in local · IST shown"><div className="overflow-x-auto"><MilestoneTimeline milestones={shipment.milestones} /></div></Panel>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="Connection risk at DXB">
        {connection ? <><div className="grid grid-cols-2 gap-3"><div className="border border-border bg-background p-3"><p className="text-xs text-muted-foreground">Scheduled connection</p><p className="mt-1 text-2xl font-semibold">{connection.scheduled}</p></div><div className="border border-warning/40 bg-warning/10 p-3"><p className="text-xs text-warning-foreground">Advisory slowdown</p><p className="mt-1 text-2xl font-semibold text-warning">{connection.slowdown}</p></div></div><div className="mt-4"><div className="flex h-3 overflow-hidden rounded-sm bg-muted">{share.map((width, index) => <span key={index} className={index === 0 ? 'bg-success' : index === 1 ? 'bg-warning' : 'bg-destructive'} style={{ width: `${width}%` }} />)}</div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>Buffer used {connection.bufferUsed}</span><span>Slowdown {connection.slowdownAmount}</span><span>Overrun {connection.overrun}</span></div><p className="mt-1 text-xs text-muted-foreground">Likely miss if slowdown &gt; 2h</p></div><dl className="mt-4 space-y-3 border-t border-border pt-4"><Field label="Cold-chain exposure">{connection.coldChain}</Field><Field label="Next protected flight">{connection.nextProtectedFlight}</Field><Field label="Customer-facing ETA">{connection.customerFacingEta}</Field><Field label="Validation">{signal?.headline ?? warning?.verdict.blockers.join(' · ') ?? 'No event validation recorded.'}</Field></dl></> : <p className="text-sm text-muted-foreground">No connection detail is recorded for this shipment.</p>}
      </Panel>
      <Panel title="Linked orders & dates"><ExposureTable rows={poRows} /><div className="mt-4 border border-border bg-background p-4"><h3 className="font-semibold">What you can do now (you decide)</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{(shipment.suggestedActions ?? []).map((action) => <li key={action}>{action}</li>)}</ul><p className="mt-3 text-xs text-muted-foreground">Advice only. No booking, rebooking or rerouting is performed.</p></div></Panel>
    </div>
  </LaneWatchShell>;
}