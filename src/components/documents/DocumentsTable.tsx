import { format } from 'date-fns';
import { 
  MoreHorizontal,
  Eye,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Ship,
  Plane,
  Package,
  Award,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDocuments } from '@/hooks/useDocuments';
import { 
  DOCUMENT_STATUS_CONFIG, 
  DOCUMENT_TYPE_CONFIG,
  type Document,
  type DocumentStatus,
  type DocumentType
} from '@/types/documents';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface DocumentsTableProps {
  filters: {
    status?: DocumentStatus;
    document_type?: DocumentType;
    search?: string;
  };
  onSelectDocument: (documentId: string) => void;
}

const documentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  commercial_invoice: FileText,
  packing_list: Package,
  bill_of_lading: Ship,
  airway_bill: Plane,
  certificate_of_origin: Award,
  insurance_certificate: Shield,
  proof_of_delivery: CheckCircle,
  other: FileText,
};

export function DocumentsTable({ filters, onSelectDocument }: DocumentsTableProps) {
  const { data: documents, isLoading } = useDocuments(filters);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!documents?.length) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No documents found</p>
          <p className="text-sm">Generate your first document or adjust filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Documents</CardTitle>
          <Badge variant="secondary">{documents.length} documents</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[160px]">Document ID</TableHead>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[140px]">Linked Order</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Validation</TableHead>
                <TableHead className="w-[100px]">Version</TableHead>
                <TableHead className="w-[100px]">Updated</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  onSelect={() => onSelectDocument(doc.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentRow({ document, onSelect }: { document: Document; onSelect: () => void }) {
  const statusConfig = DOCUMENT_STATUS_CONFIG[document.status];
  const typeConfig = DOCUMENT_TYPE_CONFIG[document.document_type];
  const DocIcon = documentIcons[document.document_type] || FileText;

  const validationOk = document.validation_status === 'passed' || 
    (!document.validation_errors?.length && !document.validation_warnings?.length);

  return (
    <TableRow 
      className="cursor-pointer hover:bg-accent/30"
      onClick={onSelect}
    >
      <TableCell className="font-medium">
        <span className="text-foreground">{document.document_number}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <DocIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{typeConfig.shortLabel}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-foreground">{document.document_name}</span>
      </TableCell>
      <TableCell>
        {document.order ? (
          <span className="text-sm text-muted-foreground">{document.order.order_number}</span>
        ) : (
          <span className="text-sm text-muted-foreground/50">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={cn(statusConfig.bgColor, statusConfig.color, 'border-0')}>
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        {validationOk ? (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm text-success">Passed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">Issues</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">v{document.version}</span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {format(new Date(document.updated_at), 'MMM dd')}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
