import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentsHeader } from '@/components/documents/DocumentsHeader';
import { DocumentsStats } from '@/components/documents/DocumentsStats';
import { DocumentsFilters } from '@/components/documents/DocumentsFilters';
import { DocumentsTable } from '@/components/documents/DocumentsTable';
import { DocumentDetailView } from '@/components/documents/DocumentDetailView';
import { CreateDocumentDialog } from '@/components/documents/CreateDocumentDialog';
import type { DocumentStatus, DocumentType } from '@/types/documents';

export default function Documents() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: DocumentStatus;
    document_type?: DocumentType;
    search?: string;
  }>({});

  if (selectedDocumentId) {
    return (
      <AppLayout>
        <DocumentDetailView
          documentId={selectedDocumentId}
          onBack={() => setSelectedDocumentId(null)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <DocumentsHeader onCreateDocument={() => setIsCreateDialogOpen(true)} />
        <DocumentsStats />
        <DocumentsFilters filters={filters} onFiltersChange={setFilters} />
        <DocumentsTable
          filters={filters}
          onSelectDocument={(documentId) => setSelectedDocumentId(documentId)}
        />
      </div>

      <CreateDocumentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </AppLayout>
  );
}
