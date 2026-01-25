import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  History,
  Sparkles,
  FileText,
  Ship,
  Plane,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  useDocument, 
  useDocumentVersions, 
  useDocumentComments, 
  useUpdateDocumentStatus,
  useAddDocumentComment
} from '@/hooks/useDocuments';
import { DOCUMENT_STATUS_CONFIG, DOCUMENT_TYPE_CONFIG, type DocumentStatus } from '@/types/documents';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentDetailViewProps {
  documentId: string;
  onBack: () => void;
}

export function DocumentDetailView({ documentId, onBack }: DocumentDetailViewProps) {
  const { data: document, isLoading } = useDocument(documentId);
  const { data: versions } = useDocumentVersions(documentId);
  const { data: comments } = useDocumentComments(documentId);
  const updateStatus = useUpdateDocumentStatus();
  const addComment = useAddDocumentComment();
  const [newComment, setNewComment] = useState('');

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    try {
      await updateStatus.mutateAsync({ documentId, status: newStatus });
      toast({ title: 'Status updated', description: `Document status changed to ${DOCUMENT_STATUS_CONFIG[newStatus].label}` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment.mutateAsync({ documentId, content: newComment });
      setNewComment('');
      toast({ title: 'Comment added' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add comment', variant: 'destructive' });
    }
  };

  if (isLoading || !document) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusConfig = DOCUMENT_STATUS_CONFIG[document.status];
  const typeConfig = DOCUMENT_TYPE_CONFIG[document.document_type];

  const hasValidationErrors = document.validation_errors && document.validation_errors.length > 0;
  const hasValidationWarnings = document.validation_warnings && document.validation_warnings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{document.document_number}</h1>
              <Badge className={cn(statusConfig.bgColor, statusConfig.color, 'border-0')}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="mt-1 text-lg text-muted-foreground">{typeConfig.label}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Version {document.version}</span>
              <span>•</span>
              <span>Created {format(new Date(document.created_at), 'MMM dd, yyyy')}</span>
              {document.order && (
                <>
                  <span>•</span>
                  <span>Linked to {document.order.order_number}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {document.status === 'approved' && (
            <Button className="gap-2" onClick={() => handleStatusChange('submitted')}>
              <Send className="h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Validation Banner */}
      {(hasValidationErrors || hasValidationWarnings) && (
        <Card className={cn(
          "border-l-4",
          hasValidationErrors ? "border-l-destructive bg-destructive/5" : "border-l-warning bg-warning-light"
        )}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn(
                "h-5 w-5 mt-0.5",
                hasValidationErrors ? "text-destructive" : "text-warning"
              )} />
              <div>
                <p className="font-medium">
                  {hasValidationErrors ? 'Validation Errors' : 'Validation Warnings'}
                </p>
                <ul className="mt-1 text-sm text-muted-foreground">
                  {document.validation_errors?.map((err, i) => (
                    <li key={`err-${i}`}>• {err.message}</li>
                  ))}
                  {document.validation_warnings?.map((warn, i) => (
                    <li key={`warn-${i}`}>• {warn.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{document.document_name}</p>
                <p className="text-sm text-muted-foreground">{typeConfig.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                hasValidationErrors ? "bg-destructive/10" : hasValidationWarnings ? "bg-warning-light" : "bg-success-light"
              )}>
                {hasValidationErrors ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {hasValidationErrors ? 'Failed' : hasValidationWarnings ? 'Warnings' : 'Passed'}
                </p>
                <p className="text-sm text-muted-foreground">Validation Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-light">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="font-medium">{format(new Date(document.updated_at), 'MMM dd, HH:mm')}</p>
                <p className="text-sm text-muted-foreground">Last Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="versions">
            <History className="mr-1 h-4 w-4" />
            Versions {versions?.length ? `(${versions.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="mr-1 h-4 w-4" />
            Comments {comments?.length ? `(${comments.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Sparkles className="mr-1 h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {document.file_url ? (
                <div className="aspect-[8.5/11] rounded-lg border bg-white p-8">
                  <p className="text-center text-muted-foreground">
                    PDF Preview would render here
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 font-medium">No file attached</p>
                  <p className="text-sm text-muted-foreground">
                    This document was generated from order data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Content Data */}
          {document.content_data && Object.keys(document.content_data).length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Document Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
                  {JSON.stringify(document.content_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              {hasValidationErrors || hasValidationWarnings ? (
                <div className="space-y-4">
                  {document.validation_errors?.map((error, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">{error.field}</p>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                      </div>
                    </div>
                  ))}
                  {document.validation_warnings?.map((warning, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning-light p-4">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-warning">{warning.field}</p>
                        <p className="text-sm text-muted-foreground">{warning.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                  <p className="mt-4 font-medium">All validations passed</p>
                  <p className="text-sm text-muted-foreground">Document is ready for approval</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              {versions?.length ? (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div key={version.id} className="flex items-start gap-4 border-l-2 border-border pl-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                        <span className="text-sm font-medium">v{version.version}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Version {version.version}</p>
                        {version.changes_summary && (
                          <p className="text-sm text-muted-foreground">{version.changes_summary}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(version.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No version history yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Comments & Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{comment.user_name || 'Anonymous'}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || addComment.isPending}
                  >
                    {addComment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Document Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 font-medium">AI insights coming soon</p>
                <p className="text-sm">
                  Automated document analysis, compliance checking, and recommendations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Document Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {document.status === 'draft' && (
              <Button onClick={() => handleStatusChange('pending_review')} disabled={updateStatus.isPending}>
                Submit for Review
              </Button>
            )}
            {document.status === 'pending_review' && (
              <>
                <Button onClick={() => handleStatusChange('reviewed')} disabled={updateStatus.isPending}>
                  Mark as Reviewed
                </Button>
                <Button variant="destructive" onClick={() => handleStatusChange('rejected')} disabled={updateStatus.isPending}>
                  Reject
                </Button>
              </>
            )}
            {document.status === 'reviewed' && (
              <>
                <Button onClick={() => handleStatusChange('approved')} disabled={updateStatus.isPending}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => handleStatusChange('rejected')} disabled={updateStatus.isPending}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
