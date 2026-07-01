import { useState, useEffect, useCallback } from 'react';

export interface Team {
  id: string;
  uniqueId: string;
  name: string;
  currency: string;
  userCount: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  access: string[];
  status: 'active' | 'deactive' | 'verified';
  teamId: string;
}

const TEAMS_KEY = 'daistrix.teams';
const USERS_KEY = 'daistrix.users';

const seedTeams: Team[] = [
  { id: 't1', uniqueId: 'CL953414', name: 'Demo INR',     currency: 'INR', userCount: 18 },
  { id: 't2', uniqueId: 'CL735155', name: 'Demo USD',     currency: 'USD', userCount: 27 },
  { id: 't3', uniqueId: 'CL789436', name: 'Daistrix US',  currency: 'USD', userCount: 29 },
  { id: 't4', uniqueId: 'CL531916', name: 'Sales Demo Accounts', currency: 'USD', userCount: 46 },
];

const defaultAccess = ['User', 'Invoice', 'Flow Edition', 'Auction', 'Enquiry', 'Dispatch', 'Tracking'];

const seedUsers: AppUser[] = [
  { id: 'u1', name: 'Aishwarya Sharma', email: 'aishwarya@daistrix.demo', phone: '+91 98200 00001', designation: 'Ops Manager',   access: defaultAccess, status: 'deactive', teamId: 't4' },
  { id: 'u2', name: 'Alex Peter',       email: 'alex@daistrix.demo',      phone: '+1 415 555 0100',  designation: 'Head of Logistics', access: defaultAccess, status: 'verified', teamId: 't4' },
  { id: 'u3', name: 'Amirah Khan',      email: 'amirah@daistrix.demo',    phone: '+971 50 000 0011', designation: 'Trade Compliance', access: defaultAccess, status: 'deactive', teamId: 't4' },
  { id: 'u4', name: 'Mohit Gala',       email: 'mohit@daistrix.demo',     phone: '+91 98200 00002', designation: 'Procurement Lead', access: defaultAccess, status: 'verified', teamId: 't4' },
  { id: 'u5', name: 'Sara Chen',        email: 'sara@daistrix.demo',      phone: '+65 8000 0100',   designation: 'Regional Ops (APAC)', access: defaultAccess, status: 'verified', teamId: 't2' },
  { id: 'u6', name: 'Diego Alvarez',    email: 'diego@daistrix.demo',     phone: '+52 55 0000 0100', designation: 'Customs Broker', access: ['User','Tracking','Dispatch'], status: 'verified', teamId: 't3' },
  { id: 'u7', name: 'Priya Menon',      email: 'priya@daistrix.demo',     phone: '+91 98200 00003', designation: 'Finance Controller', access: ['User','Invoice'], status: 'verified', teamId: 't1' },
];

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(() => load(TEAMS_KEY, seedTeams));

  const save = useCallback((next: Team[]) => {
    setTeams(next);
    localStorage.setItem(TEAMS_KEY, JSON.stringify(next));
  }, []);

  const addTeam = (t: Omit<Team, 'id' | 'uniqueId' | 'userCount'>) => {
    const team: Team = {
      ...t,
      id: `t${Date.now()}`,
      uniqueId: 'CL' + Math.floor(100000 + Math.random() * 900000),
      userCount: 0,
    };
    save([...teams, team]);
    return team;
  };

  const updateTeam = (id: string, patch: Partial<Team>) =>
    save(teams.map(t => (t.id === id ? { ...t, ...patch } : t)));

  const removeTeam = (id: string) => save(teams.filter(t => t.id !== id));

  return { teams, addTeam, updateTeam, removeTeam };
}

export function useAppUsers(teamId?: string) {
  const [users, setUsers] = useState<AppUser[]>(() => load(USERS_KEY, seedUsers));

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === USERS_KEY && e.newValue) setUsers(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const save = useCallback((next: AppUser[]) => {
    setUsers(next);
    localStorage.setItem(USERS_KEY, JSON.stringify(next));
  }, []);

  const filtered = teamId ? users.filter(u => u.teamId === teamId) : users;

  const addUser = (u: Omit<AppUser, 'id' | 'status'> & { status?: AppUser['status'] }) => {
    const user: AppUser = { ...u, id: `u${Date.now()}`, status: u.status ?? 'deactive' };
    save([...users, user]);
    return user;
  };
  const updateUser = (id: string, patch: Partial<AppUser>) =>
    save(users.map(u => (u.id === id ? { ...u, ...patch } : u)));
  const removeUser = (id: string) => save(users.filter(u => u.id !== id));
  const setStatus = (id: string, status: AppUser['status']) => updateUser(id, { status });

  return { users: filtered, allUsers: users, addUser, updateUser, removeUser, setStatus };
}

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  rfqId?: string;
  quoteId?: string;
  laneId?: string;
  vendor: string;
  mode: string;
  type: string;
  incoterm: string;
  originPort: string;
  destinationPort: string;
  containers: { size: string; qty: number }[];
  weight: number;
  weightUnit: string;
  volume: number;
  volumeUnit: string;
  packageType: string;
  shipper?: string;
  consignee?: string;
  customer?: string;
  poNumber: string;
  cargoValue: number;
  cargoCurrency: string;
  executionMonth: string;
  additionalNotes: string;
  customFields: Record<string, string>;
  createdAt: string;
}

const DISPATCHES_KEY = 'daistrix.dispatches';

export function useDispatches() {
  const [dispatches, setDispatches] = useState<Dispatch[]>(() => load(DISPATCHES_KEY, [] as Dispatch[]));

  const save = useCallback((next: Dispatch[]) => {
    setDispatches(next);
    localStorage.setItem(DISPATCHES_KEY, JSON.stringify(next));
  }, []);

  const addDispatch = (d: Omit<Dispatch, 'id' | 'dispatchNumber' | 'createdAt'>) => {
    const seq = String(dispatches.length + 1).padStart(5, '0');
    const dispatch: Dispatch = {
      ...d,
      id: `d${Date.now()}`,
      dispatchNumber: `DSP-${new Date().getFullYear()}-${seq}`,
      createdAt: new Date().toISOString(),
    };
    save([dispatch, ...dispatches]);
    return dispatch;
  };

  return { dispatches, addDispatch };
}