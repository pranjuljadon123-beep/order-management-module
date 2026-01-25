import { Plus, Upload, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentsHeaderProps {
  onCreateDocument: () => void;
}

export function DocumentsHeader({ onCreateDocument }: DocumentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Document Management
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create, validate, and manage all logistics documents
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Validate
        </Button>
        <Button onClick={onCreateDocument} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Document
        </Button>
      </div>
    </div>
  );
}
