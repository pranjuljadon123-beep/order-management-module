import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Document, DocumentStatus, DocumentType, DocumentVersion, DocumentComment, DocumentTemplate } from '@/types/documents';

// Fetch all documents with optional filters
export function useDocuments(filters?: {
  status?: DocumentStatus;
  document_type?: DocumentType;
  order_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(`
          *,
          order:orders(order_number)
        `)
        .eq('is_latest', true)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.document_type) {
        query = query.eq('document_type', filters.document_type);
      }
      if (filters?.order_id) {
        query = query.eq('order_id', filters.order_id);
      }
      if (filters?.search) {
        query = query.or(`document_number.ilike.%${filters.search}%,document_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Document[];
    },
  });
}

// Fetch single document by ID
export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          order:orders(order_number)
        `)
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data as unknown as Document;
    },
    enabled: !!documentId,
  });
}

// Fetch document versions
export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as DocumentVersion[];
    },
    enabled: !!documentId,
  });
}

// Fetch document comments
export function useDocumentComments(documentId: string) {
  return useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as DocumentComment[];
    },
    enabled: !!documentId,
  });
}

// Fetch document templates
export function useDocumentTemplates(documentType?: DocumentType) {
  return useQuery({
    queryKey: ['document-templates', documentType],
    queryFn: async () => {
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true);

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DocumentTemplate[];
    },
  });
}

// Create document mutation
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: Partial<Document>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('documents')
        .insert([documentData] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Update document mutation
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, updates }: { documentId: string; updates: Partial<Document> }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates as Record<string, unknown>)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
    },
  });
}

// Update document status mutation
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, status }: { documentId: string; status: DocumentStatus }) => {
      const updateData: Record<string, unknown> = { status };
      
      // Add timestamp based on status
      if (status === 'reviewed') {
        updateData.reviewed_at = new Date().toISOString();
      } else if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
    },
  });
}

// Add comment mutation
export function useAddDocumentComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, content, userName }: { documentId: string; content: string; userName?: string }) => {
      const { data, error } = await supabase
        .from('document_comments')
        .insert([{
          document_id: documentId,
          content,
          user_name: userName || 'Anonymous',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-comments', variables.documentId] });
    },
  });
}

// Get document stats
export function useDocumentStats() {
  return useQuery({
    queryKey: ['document-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('status, validation_status, risk_score')
        .eq('is_latest', true);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        draft: data?.filter(d => d.status === 'draft').length || 0,
        pending_review: data?.filter(d => d.status === 'pending_review').length || 0,
        approved: data?.filter(d => d.status === 'approved').length || 0,
        submitted: data?.filter(d => d.status === 'submitted').length || 0,
        rejected: data?.filter(d => d.status === 'rejected').length || 0,
        validation_issues: data?.filter(d => d.validation_status === 'failed').length || 0,
        high_risk: data?.filter(d => (d.risk_score || 0) > 50).length || 0,
      };

      return stats;
    },
  });
}
