import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderStatus, OrderType, OrderDocument, OrderShipment, OrderStateTransition } from '@/types/orders';

// Fetch all orders with optional filters
export function useOrders(filters?: {
  status?: OrderStatus;
  order_type?: OrderType;
  mode?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name),
          shipper:shippers(name),
          consignee:consignees(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.order_type) {
        query = query.eq('order_type', filters.order_type);
      }
      if (filters?.mode) {
        query = query.eq('mode', filters.mode);
      }
      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,po_number.ilike.%${filters.search}%,commodity_description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Order[];
    },
  });
}

// Fetch single order by ID
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name),
          shipper:shippers(name),
          consignee:consignees(name)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as unknown as Order;
    },
    enabled: !!orderId,
  });
}

// Fetch order documents
export function useOrderDocuments(orderId: string) {
  return useQuery({
    queryKey: ['order-documents', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_documents')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OrderDocument[];
    },
    enabled: !!orderId,
  });
}

// Fetch order shipments
export function useOrderShipments(orderId: string) {
  return useQuery({
    queryKey: ['order-shipments', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_shipments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OrderShipment[];
    },
    enabled: !!orderId,
  });
}

// Fetch order state transitions (activity log)
export function useOrderStateTransitions(orderId: string) {
  return useQuery({
    queryKey: ['order-transitions', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_state_transitions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OrderStateTransition[];
    },
    enabled: !!orderId,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Update order mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      // Increment version for audit trail
      const { data: current } = await supabase
        .from('orders')
        .select('version')
        .eq('id', orderId)
        .single();

      const newVersion = (current?.version || 0) + 1;

      const { data, error } = await supabase
        .from('orders')
        .update({ ...(updates as Record<string, unknown>), version: newVersion })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-transitions', variables.orderId] });
    },
  });
}

// Get order stats
export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status, risk_level');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        created: data?.filter(o => o.status === 'created').length || 0,
        confirmed: data?.filter(o => o.status === 'confirmed').length || 0,
        ready_to_ship: data?.filter(o => o.status === 'ready_to_ship').length || 0,
        booked: data?.filter(o => o.status === 'booked').length || 0,
        in_transit: data?.filter(o => o.status === 'in_transit').length || 0,
        delivered: data?.filter(o => o.status === 'delivered').length || 0,
        high_risk: data?.filter(o => o.risk_level === 'high' || o.risk_level === 'critical').length || 0,
      };

      return stats;
    },
  });
}
