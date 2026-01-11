import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useProfile } from '@/hooks/useAuth';
import { useVendorRfq, useVendorQuotes, useVendorSubmitQuote, useAcceptInvitation } from '@/hooks/useVendorPortal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Ship, Loader2, MapPin, Package, Clock, Calendar,
  DollarSign, Plus, Trash2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { RfqLane, Surcharge } from '@/types/procurement';

const VendorRfqDetail = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: rfqData, isLoading: rfqLoading, error: rfqError } = useVendorRfq(rfqId || '');
  const { data: quotes, isLoading: quotesLoading } = useVendorQuotes(rfqId || '');
  const submitQuote = useVendorSubmitQuote();
  const acceptInvitation = useAcceptInvitation();

  const [selectedLane, setSelectedLane] = useState<RfqLane | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  
  // Quote form state
  const [baseRate, setBaseRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [rateUnit, setRateUnit] = useState('per container');
  const [transitDays, setTransitDays] = useState('');
  const [validityStart, setValidityStart] = useState('');
  const [validityEnd, setValidityEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);

  if (authLoading || profileLoading || rfqLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user || profile?.role !== 'vendor') {
    navigate('/auth?role=vendor');
    return null;
  }

  if (rfqError || !rfqData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="font-semibold text-lg">Access Denied</h3>
            <p className="text-muted-foreground mt-2">
              You don't have access to this RFQ or it doesn't exist.
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => navigate('/vendor')}
            >
              Back to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { rfq, invitation } = rfqData;
  const lanes = rfq.lanes || [];
  const isInvitationPending = invitation.status === 'pending';

  const modeLabels: Record<string, string> = {
    ocean_fcl: 'Ocean FCL',
    ocean_lcl: 'Ocean LCL',
    air: 'Air Freight',
    road: 'Road',
    rail: 'Rail',
  };

  const handleAcceptInvitation = async () => {
    await acceptInvitation.mutateAsync(invitation.id);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLane) return;

    await submitQuote.mutateAsync({
      rfq_id: rfq.id,
      lane_id: selectedLane.id,
      base_freight_rate: parseFloat(baseRate),
      currency,
      rate_unit: rateUnit,
      transit_time_days: transitDays ? parseInt(transitDays) : undefined,
      validity_start: validityStart || undefined,
      validity_end: validityEnd || undefined,
      surcharges,
      notes: notes || undefined,
    });

    // Reset form
    setShowQuoteForm(false);
    setSelectedLane(null);
    setBaseRate('');
    setTransitDays('');
    setValidityStart('');
    setValidityEnd('');
    setNotes('');
    setSurcharges([]);
  };

  const addSurcharge = () => {
    setSurcharges([...surcharges, { name: '', amount: 0, type: 'fixed' }]);
  };

  const removeSurcharge = (index: number) => {
    setSurcharges(surcharges.filter((_, i) => i !== index));
  };

  const updateSurcharge = (index: number, field: keyof Surcharge, value: any) => {
    const updated = [...surcharges];
    updated[index] = { ...updated[index], [field]: value };
    setSurcharges(updated);
  };

  const calculateTotal = () => {
    const base = parseFloat(baseRate) || 0;
    const surchargesTotal = surcharges.reduce((sum, s) => {
      return sum + (s.type === 'fixed' ? s.amount : base * (s.amount / 100));
    }, 0);
    return base + surchargesTotal;
  };

  const getLaneQuote = (laneId: string) => {
    return quotes?.find(q => q.lane_id === laneId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendor')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Ship className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{rfq.title}</h1>
              <p className="text-xs text-muted-foreground font-mono">{rfq.rfq_number}</p>
            </div>
          </div>
          <Badge variant="outline" className="ml-auto">
            {modeLabels[rfq.mode] || rfq.mode}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {isInvitationPending ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle>Invitation Pending</CardTitle>
              <CardDescription>
                Accept this invitation to submit quotes for the lanes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                className="bg-accent hover:bg-accent/90"
                onClick={handleAcceptInvitation}
                disabled={acceptInvitation.isPending}
              >
                {acceptInvitation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Accept Invitation
              </Button>
            </CardContent>
          </Card>
        ) : showQuoteForm && selectedLane ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submit Quote - Lane {selectedLane.lane_number}</CardTitle>
                  <CardDescription>
                    {selectedLane.origin_city}, {selectedLane.origin_country} → {selectedLane.destination_city}, {selectedLane.destination_country}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowQuoteForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuote} className="space-y-6">
                {/* Pricing */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="baseRate">Base Freight Rate *</Label>
                    <Input
                      id="baseRate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={baseRate}
                      onChange={(e) => setBaseRate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Unit</Label>
                    <Select value={rateUnit} onValueChange={setRateUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="per container">Per Container</SelectItem>
                        <SelectItem value="per TEU">Per TEU</SelectItem>
                        <SelectItem value="per CBM">Per CBM</SelectItem>
                        <SelectItem value="per kg">Per kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Surcharges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Surcharges</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSurcharge}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {surcharges.map((surcharge, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Surcharge name (e.g., BAF)"
                        value={surcharge.name}
                        onChange={(e) => updateSurcharge(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={surcharge.amount || ''}
                        onChange={(e) => updateSurcharge(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                      <Select 
                        value={surcharge.type} 
                        onValueChange={(v) => updateSurcharge(index, 'type', v)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeSurcharge(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="bg-muted/30 rounded-lg p-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Base Rate</span>
                      <span>{currency} {parseFloat(baseRate || '0').toFixed(2)}</span>
                    </div>
                    {surcharges.length > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Surcharges</span>
                        <span>+{currency} {(calculateTotal() - (parseFloat(baseRate) || 0)).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Landed Cost</span>
                      <span className="text-accent">{currency} {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Transit & Validity */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="transitDays">Transit Time (days)</Label>
                    <Input
                      id="transitDays"
                      type="number"
                      placeholder="0"
                      value={transitDays}
                      onChange={(e) => setTransitDays(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validityStart">Valid From</Label>
                    <Input
                      id="validityStart"
                      type="date"
                      value={validityStart}
                      onChange={(e) => setValidityStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validityEnd">Valid To</Label>
                    <Input
                      id="validityEnd"
                      type="date"
                      value={validityEnd}
                      onChange={(e) => setValidityEnd(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional terms or conditions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-accent/90"
                    disabled={submitQuote.isPending || !baseRate}
                  >
                    {submitQuote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Submit Quote
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* RFQ Info */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lanes</p>
                      <p className="text-xl font-semibold">{lanes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {rfq.bid_deadline && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="text-xl font-semibold">
                          {format(new Date(rfq.bid_deadline), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {rfq.contract_duration_months && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contract</p>
                        <p className="text-xl font-semibold">{rfq.contract_duration_months} months</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Your Quotes</p>
                      <p className="text-xl font-semibold">{quotes?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lanes */}
            <Card>
              <CardHeader>
                <CardTitle>Lanes</CardTitle>
                <CardDescription>Submit quotes for each lane you want to bid on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lanes.map((lane) => {
                    const existingQuote = getLaneQuote(lane.id);
                    return (
                      <div 
                        key={lane.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold">
                            {lane.lane_number}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {lane.origin_city}, {lane.origin_country}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium">
                                {lane.destination_city}, {lane.destination_country}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              {lane.equipment_type && (
                                <span>{lane.equipment_type}</span>
                              )}
                              {lane.estimated_volume && (
                                <span>Est. volume: {lane.estimated_volume}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {existingQuote ? (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-muted-foreground">
                                Quoted: {existingQuote.currency} {existingQuote.total_landed_cost?.toFixed(2)}
                              </span>
                            </div>
                          ) : null}
                          <Button
                            size="sm"
                            variant={existingQuote ? 'outline' : 'default'}
                            className={!existingQuote ? 'bg-accent hover:bg-accent/90' : ''}
                            onClick={() => {
                              setSelectedLane(lane);
                              setShowQuoteForm(true);
                            }}
                          >
                            {existingQuote ? 'Update Quote' : 'Submit Quote'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorRfqDetail;
