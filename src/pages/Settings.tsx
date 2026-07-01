import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useTeams, useAppUsers, type AppUser, type Team } from '@/hooks/useTeamsUsers';
import { useShippers, useConsignees, useCustomers, useCreateShipper, useCreateConsignee, useCreateCustomer } from '@/hooks/useEntities';
import { useCarriers } from '@/hooks/useProcurement';
import { Users, Building2, Truck, Ship, Package, Settings2, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ACCESS_MODULES = ['User', 'Invoice', 'Flow Edition', 'Auction', 'Enquiry', 'Dispatch', 'Tracking', 'Documents', 'Reports'];

function StatusPill({ status }: { status: AppUser['status'] }) {
  const cls =
    status === 'verified' ? 'bg-success/10 text-success border-success/20' :
    status === 'active'   ? 'bg-accent/10 text-accent border-accent/20' :
                            'bg-warning/10 text-warning border-warning/20';
  return <Badge variant="outline" className={cn('capitalize', cls)}>{status}</Badge>;
}

/* ------------------------------ Users List ------------------------------ */
function UsersTab({ teamId }: { teamId?: string }) {
  const { users, addUser, removeUser, setStatus, updateUser } = useAppUsers(teamId);
  const [q, setQ] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', designation: '', access: ['User'] as string[] });

  const filtered = users.filter(u =>
    !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  );

  const submit = () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    addUser({ ...form, teamId: teamId ?? 't4' });
    toast.success(`Invited ${form.name}`);
    setForm({ name: '', email: '', phone: '', designation: '', access: ['User'] });
    setOpenAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('CSV export coming soon')}>Export</Button>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" />Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite user</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Full name</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input className="mt-1" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input className="mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Designation</Label><Input className="mt-1" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
                <div className="col-span-2">
                  <Label>Module Access</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {ACCESS_MODULES.map(m => (
                      <label key={m} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.access.includes(m)}
                          onCheckedChange={c => setForm({
                            ...form,
                            access: c ? [...form.access, m] : form.access.filter(x => x !== m),
                          })}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
                <Button onClick={submit}>Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                <TableCell>{u.designation}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {u.access.slice(0, 3).map(a => <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>)}
                    {u.access.length > 3 && <Badge variant="outline" className="text-xs">+{u.access.length - 3}</Badge>}
                  </div>
                </TableCell>
                <TableCell><StatusPill status={u.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Select value={u.status} onValueChange={(v: AppUser['status']) => { setStatus(u.id, v); toast.success(`${u.name} marked ${v}`); }}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deactive">Deactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => { removeUser(u.id); toast.success('User removed'); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No users match your search.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ------------------------------ Teams ------------------------------ */
function TeamsTab({ onSelect }: { onSelect: (t: Team) => void }) {
  const { teams, addTeam, removeTeam } = useTeams();
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ name: '', currency: 'USD' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Team Management</h3>
          <p className="text-sm text-muted-foreground">Organize users into teams. Each team has its own workspace and currency.</p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" />New Team</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Team name</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['USD','INR','EUR','GBP','AED','SGD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
              <Button onClick={() => { if (!form.name) return toast.error('Name required'); addTeam(form); toast.success('Team created'); setOpenAdd(false); setForm({ name: '', currency: 'USD' }); }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(t => (
          <div key={t.id} className="rounded-lg border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-base">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1">Unique ID: {t.uniqueId}</div>
              </div>
              <Badge variant="outline">{t.currency}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> {t.userCount} users
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onSelect(t)}>Manage</Button>
              <Button size="sm" variant="ghost" onClick={() => { removeTeam(t.id); toast.success('Team removed'); }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Simple master table ------------------------------ */
function MasterTable({
  title, rows, columns, onAdd,
}: {
  title: string;
  rows: any[];
  columns: { key: string; label: string }[];
  onAdd?: () => void;
}) {
  const [q, setQ] = useState('');
  const filtered = rows.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${title.toLowerCase()}...`} className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {onAdd && <Button size="sm" onClick={onAdd} className="bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" />Add {title}</Button>}
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>{columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, i) => (
              <TableRow key={r.id || i}>
                {columns.map(c => <TableCell key={c.key}>{r[c.key] ?? '—'}</TableCell>)}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">No records.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ------------------------------ Preferences ------------------------------ */
function PreferencesTab() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    smsAlerts: false,
    dailyBriefing: true,
    weeklyReport: true,
    autoAssignAgents: false,
    defaultIncoterm: 'CIF',
    defaultCurrency: 'USD',
  });
  const patch = (p: Partial<typeof prefs>) => { setPrefs(v => ({ ...v, ...p })); toast.success('Preference saved'); };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h3 className="font-semibold">Notifications</h3>
        {[
          ['emailNotifications', 'Email notifications', 'Receive alerts about shipments, quotes, and invoices'],
          ['smsAlerts', 'SMS alerts', 'Critical exceptions delivered via SMS'],
          ['dailyBriefing', 'Daily operations briefing', 'Morning summary of active shipments and pending actions'],
          ['weeklyReport', 'Weekly performance report', 'KPIs, spend, and vendor performance summary'],
          ['autoAssignAgents', 'Auto-assign customs agents', 'Automatically assign brokers based on origin/destination'],
        ].map(([k, l, d]) => (
          <div key={k as string} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{l}</div>
              <div className="text-xs text-muted-foreground">{d}</div>
            </div>
            <Switch checked={(prefs as any)[k as string]} onCheckedChange={v => patch({ [k as string]: v } as any)} />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h3 className="font-semibold">Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Default Incoterm</Label>
            <Select value={prefs.defaultIncoterm} onValueChange={v => patch({ defaultIncoterm: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{['EXW','FCA','FOB','CIF','DAP','DDP'].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default Currency</Label>
            <Select value={prefs.defaultCurrency} onValueChange={v => patch({ defaultCurrency: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{['USD','INR','EUR','GBP','AED','SGD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Page ------------------------------ */
export default function Settings() {
  const { teams } = useTeams();
  const [activeTeam, setActiveTeam] = useState<string | undefined>(teams[3]?.id ?? teams[0]?.id);
  const [tab, setTab] = useState('users');

  const { data: shippers = [] } = useShippers();
  const { data: consignees = [] } = useConsignees();
  const { data: customers = [] } = useCustomers();
  const { data: carriers = [] } = useCarriers();
  const createShipper = useCreateShipper();
  const createConsignee = useCreateConsignee();
  const createCustomer = useCreateCustomer();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage users, teams, masters and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">Team</Label>
            <Select value={activeTeam} onValueChange={setActiveTeam}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name} · {t.currency}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-7 max-w-4xl">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="teams"><Building2 className="h-4 w-4 mr-1" />Teams</TabsTrigger>
            <TabsTrigger value="vendors"><Truck className="h-4 w-4 mr-1" />Vendors</TabsTrigger>
            <TabsTrigger value="consignees"><Package className="h-4 w-4 mr-1" />Consignees</TabsTrigger>
            <TabsTrigger value="shippers"><Ship className="h-4 w-4 mr-1" />Shippers</TabsTrigger>
            <TabsTrigger value="carriers"><Truck className="h-4 w-4 mr-1" />Carriers</TabsTrigger>
            <TabsTrigger value="preferences"><Settings2 className="h-4 w-4 mr-1" />Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersTab teamId={activeTeam} />
          </TabsContent>
          <TabsContent value="teams" className="mt-6">
            <TeamsTab onSelect={(t) => { setActiveTeam(t.id); setTab('users'); }} />
          </TabsContent>
          <TabsContent value="vendors" className="mt-6">
            <MasterTable
              title="Vendor"
              rows={customers}
              columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'country', label: 'Country' }]}
              onAdd={() => {
                const name = prompt('Vendor name?');
                if (name) createCustomer.mutate({ name, is_active: true } as any);
              }}
            />
          </TabsContent>
          <TabsContent value="consignees" className="mt-6">
            <MasterTable
              title="Consignee"
              rows={consignees}
              columns={[{ key: 'name', label: 'Name' }, { key: 'city', label: 'City' }, { key: 'country', label: 'Country' }, { key: 'port_code', label: 'Port' }]}
              onAdd={() => {
                const name = prompt('Consignee name?');
                if (name) createConsignee.mutate({ name, is_active: true } as any);
              }}
            />
          </TabsContent>
          <TabsContent value="shippers" className="mt-6">
            <MasterTable
              title="Shipper"
              rows={shippers}
              columns={[{ key: 'name', label: 'Name' }, { key: 'city', label: 'City' }, { key: 'country', label: 'Country' }, { key: 'port_code', label: 'Port' }]}
              onAdd={() => {
                const name = prompt('Shipper name?');
                if (name) createShipper.mutate({ name, is_active: true } as any);
              }}
            />
          </TabsContent>
          <TabsContent value="carriers" className="mt-6">
            <MasterTable
              title="Carrier"
              rows={carriers}
              columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'mode', label: 'Mode' }, { key: 'rating', label: 'Rating' }]}
            />
          </TabsContent>
          <TabsContent value="preferences" className="mt-6">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}