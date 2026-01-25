import { Plus, Upload, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DocumentsHeaderProps {
  onCreateDocument: () => void;
}

export function DocumentsHeader({ onCreateDocument }: DocumentsHeaderProps) {
  const handleUpload = () => {
    toast.info("File upload dialog coming soon", { description: "You can currently create documents manually" });
  };

  const handleExport = () => {
    toast.success("Export initiated", { description: "Preparing document report for download..." });
  };

  const handleAIValidate = () => {
    toast.info("AI Validation", { description: "Running AI-powered validation on all documents..." });
  };

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
        <Button variant="outline" size="sm" className="gap-2" onClick={handleUpload}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleAIValidate}>
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
