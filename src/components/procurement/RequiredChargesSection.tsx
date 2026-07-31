import { AlertCircle, Anchor, Ship } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getIncotermRule, isFreightNotRequired } from '@/lib/rfqWorkflow';

interface RequiredChargesSectionProps {
  incoterm?: string | null;
  pickDrop?: string | null;
  /** Charges the buyer wants vendors to quote. */
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Required Charges — driven entirely by the selected Incoterm.
 * Until an incoterm is picked there is nothing to show but the warning state.
 */
export function RequiredChargesSection({ incoterm, pickDrop, value, onChange }: RequiredChargesSectionProps) {
  const rule = getIncotermRule(incoterm);

  if (!rule) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-warning/50 bg-warning-light/40 p-3 text-sm text-warning">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Please select an incoterm to load the applicable services.
      </div>
    );
  }

  const toggle = (charge: string) =>
    onChange(value.includes(charge) ? value.filter((c) => c !== charge) : [...value, charge]);

  const row = (title: string, icon: React.ReactNode, charges: string[], scope: string) => (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      {charges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Not applicable under {incoterm} — arranged by the counterparty.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {charges.map((c) => {
            const key = `${scope}: ${c}`;
            return (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
              >
                <Checkbox checked={value.includes(key)} onCheckedChange={() => toggle(key)} />
                <span className="truncate">{c}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 rounded-lg border border-border/60 p-4">
      <p className="text-sm text-muted-foreground">{rule.note}</p>
      {row('Origin', <Anchor className="h-3.5 w-3.5" />, rule.origin, 'Origin')}
      {row('Destination', <Ship className="h-3.5 w-3.5" />, rule.destination, 'Destination')}
      {isFreightNotRequired(incoterm, pickDrop) && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Under {incoterm} the main carriage is arranged by the counterparty — no freight will be procured for this RFQ.
        </div>
      )}
    </div>
  );
}
