import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useProfile, useSignOut } from '@/hooks/useAuth';
import { useVendorRfqs, useAcceptInvitation } from '@/hooks/useVendorPortal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ship, LogOut, FileText, Clock, MapPin, Package,
  ChevronRight, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { Rfq } from '@/types/procurement';

const VendorPortal = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: rfqs, isLoading: rfqsLoading } = useVendorRfqs();
  const signOut = useSignOut();
  const acceptInvitation = useAcceptInvitation();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth?role=vendor');
    return null;
  }

  if (profile?.role !== 'vendor') {
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    await signOut.mutateAsync();
    navigate('/auth');
  };

  const pendingRfqs = rfqs?.filter(r => r.invitation?.status === 'pending') || [];
  const activeRfqs = rfqs?.filter(r => r.invitation?.status === 'accepted') || [];

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    published: { label: 'Open for Quotes', variant: 'default' },
    bidding: { label: 'Bidding Active', variant: 'default' },
    evaluation: { label: 'Under Evaluation', variant: 'secondary' },
  };

  const modeLabels: Record<string, string> = {
    ocean_fcl: 'Ocean FCL',
    ocean_lcl: 'Ocean LCL',
    air: 'Air Freight',
    road: 'Road',
    rail: 'Rail',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Ship className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Vendor Portal</h1>
              <p className="text-xs text-muted-foreground">{profile?.full_name || profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Your RFQ Invitations</h2>
          <p className="text-muted-foreground">
            View and respond to freight quotation requests
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending ({pendingRfqs.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active ({activeRfqs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {rfqsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : pendingRfqs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg">No Pending Invitations</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You don't have any pending RFQ invitations at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingRfqs.map((rfq) => (
                  <RfqCard
                    key={rfq.id}
                    rfq={rfq}
                    statusConfig={statusConfig}
                    modeLabels={modeLabels}
                    onAccept={() => acceptInvitation.mutate(rfq.invitation.id)}
                    onView={() => navigate(`/vendor/rfq/${rfq.id}`)}
                    isPending
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {rfqsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : activeRfqs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg">No Active RFQs</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Accept pending invitations to start submitting quotes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeRfqs.map((rfq) => (
                  <RfqCard
                    key={rfq.id}
                    rfq={rfq}
                    statusConfig={statusConfig}
                    modeLabels={modeLabels}
                    onView={() => navigate(`/vendor/rfq/${rfq.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

interface RfqCardProps {
  rfq: Rfq;
  statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }>;
  modeLabels: Record<string, string>;
  onAccept?: () => void;
  onView: () => void;
  isPending?: boolean;
}

function RfqCard({ rfq, statusConfig, modeLabels, onAccept, onView, isPending }: RfqCardProps) {
  const status = statusConfig[rfq.status] || { label: rfq.status, variant: 'outline' as const };
  const lanes = rfq.lanes || [];

  return (
    <Card className="hover:border-accent/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{rfq.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs">{rfq.rfq_number}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {modeLabels[rfq.mode] || rfq.mode}
              </Badge>
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{lanes.length} Lane{lanes.length !== 1 ? 's' : ''}</span>
          </div>
          {rfq.bid_deadline && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {format(new Date(rfq.bid_deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
          {lanes[0] && (
            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {lanes[0].origin_city} → {lanes[0].destination_city}
                {lanes.length > 1 && ` +${lanes.length - 1} more`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {isPending && onAccept && (
            <Button variant="outline" size="sm" onClick={onAccept}>
              Accept Invitation
            </Button>
          )}
          <Button 
            size="sm" 
            className="bg-accent hover:bg-accent/90"
            onClick={onView}
          >
            {isPending ? 'View Details' : 'Submit Quote'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default VendorPortal;
