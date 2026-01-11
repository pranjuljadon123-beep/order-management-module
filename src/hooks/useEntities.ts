import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Shipper, Consignee, Customer } from '@/types/entities';
import { toast } from 'sonner';

// Shippers
export function useShippers() {
  return useQuery({
    queryKey: ['shippers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shippers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Shipper[];
    },
  });
}

export function useCreateShipper() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Partial<Shipper>) => {
      const { data, error } = await supabase
        .from('shippers')
        .insert(input as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as Shipper;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
      toast.success('Shipper created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create shipper: ' + error.message);
    },
  });
}

// Consignees
export function useConsignees() {
  return useQuery({
    queryKey: ['consignees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consignees')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Consignee[];
    },
  });
}

export function useCreateConsignee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Partial<Consignee>) => {
      const { data, error } = await supabase
        .from('consignees')
        .insert(input as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as Consignee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consignees'] });
      toast.success('Consignee created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create consignee: ' + error.message);
    },
  });
}

// Customers
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Partial<Customer>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(input as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer: ' + error.message);
    },
  });
}

// Helper to get full address from entity
export function getEntityAddress(entity: Shipper | Consignee | Customer | null): string {
  if (!entity) return '';
  const parts = [
    entity.address_line1,
    entity.address_line2,
    entity.city,
    entity.state,
    entity.postal_code,
    entity.country,
  ].filter(Boolean);
  return parts.join(', ');
}

// Helper to get port code from shipper/consignee
export function getEntityPort(entity: Shipper | Consignee | null): string {
  if (!entity) return '';
  return (entity as Shipper | Consignee).port_code || '';
}
