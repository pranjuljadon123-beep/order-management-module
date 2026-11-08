import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LaneWatchShell } from '@/components/lanewatch/LaneWatchShell';
import { ExposureTable, Field, MissingPanel, MilestoneTimeline, Panel, StatusPill } from '@/components/lanewatch/LaneWatchCommon';
import { useLaneWatch } from '@/hooks/useLaneWatch';
import { formatDate, formatWindow } from '@/lib/lanewatch/exposure';

export default function LaneWatchOcean() {
  const { reference = '' } = useParams();
  const data = useLaneWatch();
  const shipment = data.getShipment(decodeURIComponent(reference));
  if (!shipment || shipment.mode !== 'ocean') return <LaneWatchShell title="Ocean visibility" section="Ocean" context="Shipment lookup"><MissingPanel message="Shipment not found in LaneWatch" /></LaneWatchShell>;

  const warning = data.warnings.find(({ event }) => data.exposures.get(event.id)?.shipmentIds.includes(shipment.id));
  const exposure = warning ? data.exposures.get(warning.event.id) : undefined;
  const poRows = exposure?.poExposures.filter((po) => shipment.linkedPoIds.includes(po.poId)) ?? [];
  const worstPo = poRows[0];
  const context = `Container ${shipment.transportDoc}`;
  return <LaneWatchShell title={`Ocean visibility · ${shipment.reference}`} section="Ocean" context={context}>
    <section className="border border-border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Field label="Container">{shipment.transportDoc} · {shipment.equipment ?? 'Equipment not recorded'}</Field>
        <Field label="Vessel / voyage">{shipment.vesselOrFlight}</Field>
        <Field label="Lane">{shipment.lane}</Field>
        <Field label="Shipper / cargo">{shipment.cargo}</Field>
        <Field label="Carrier">{shipment.carrier}</Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">{warning ? <StatusPill status={warning.verdict.status} /> : <span className="text-sm text-muted-foreground">No linked warning</span>}{warning && <span className="text-sm">· {warning.event.title}</span>}<span className="ml-auto text-xs text-muted-foreground">Milestones: carrier/forwarder feed (concept)</span></div>
    </section>

    <Panel title="Container milestones" caption="Times in IST"><div className="overflow-x-auto"><MilestoneTimeline milestones={shipment.milestones} /></div></Panel>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="ETD / ETA">
        <div className="space-y-4">
          {[
            { label: 'ETD origin', plan: shipment.plannedDeparture, revised: shipment.milestones.find((m) => m.key === 'etd')?.estimatedFrom ?? shipment.milestones.find((m) => m.key === 'etd')?.actualAt },
            { label: 'ETA via port', plan: shipment.milestones.find((m) => m.key.startsWith('ts_'))?.plannedAt, revised: shipment.milestones.find((m) => m.key.startsWith('ts_'))?.estimatedFrom },
            { label: 'ETA destination', plan: shipment.plannedArrival, revised: shipment.revisedArrivalFrom },
          ].map((date) => <div key={date.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border pb-3 last:border-0"><div><p className="text-xs text-muted-foreground">{date.label}</p><p className="mt-1 text-sm"><s className="text-muted-foreground">{formatDate(date.plan)}</s></p></div><ArrowRight className="h-4 w-4 text-muted-foreground" /><div className="text-right"><p className="text-xs text-muted-foreground">Revised</p><p className={`mt-1 text-sm font-semibold ${worstPo?.status === 'AT_RISK' ? 'text-destructive' : 'text-warning'}`}>{formatWindow(date.revised, date.label === 'ETA destination' ? shipment.revisedArrivalTo : date.revised)}</p></div></div>)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Delay window is LaneWatch's estimate, not a carrier commitment.</p>
      </Panel>
      <Panel title="Purchase-order impact" caption="Need-by vs revised window"><ExposureTable rows={poRows} />
        {warning && <div className="mt-4 border border-border bg-background p-3"><p className="font-semibold">Why this shipment is flagged</p><p className="mt-1 text-sm text-muted-foreground">{warning.event.summary}</p>{worstPo && <p className="mt-2 text-sm">{worstPo.poNumber}: {worstPo.rationale}</p>}<p className="mt-2 text-xs text-muted-foreground">Source trail: {warning.verdict.reasons.join(' · ')}</p></div>}
      </Panel>
    </div>
  </LaneWatchShell>;
}