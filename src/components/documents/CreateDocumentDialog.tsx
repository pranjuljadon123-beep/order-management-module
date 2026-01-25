import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDocument } from '@/hooks/useDocuments';
import { useOrders } from '@/hooks/useOrders';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const documentSchema = z.object({
  document_type: z.enum([
    'commercial_invoice',
    'packing_list',
    'bill_of_lading',
    'airway_bill',
    'shipping_instructions',
    'certificate_of_origin',
    'insurance_certificate',
    'proof_of_delivery',
    'customs_declaration',
    'inspection_certificate',
    'other'
  ]),
  document_name: z.string().min(1, 'Document name is required'),
  order_id: z.string().optional(),
  shipment_id: z.string().optional(),
  incoterms: z.string().optional(),
  country_of_origin: z.string().optional(),
  destination_country: z.string().optional(),
  notes: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDocumentDialog({ open, onOpenChange }: CreateDocumentDialogProps) {
  const createDocument = useCreateDocument();
  const { data: orders } = useOrders();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      document_type: 'commercial_invoice',
      document_name: '',
    },
  });

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      await createDocument.mutateAsync({
        ...data,
        order_id: data.order_id || undefined,
      });
      toast({ title: 'Document created', description: 'Your document has been generated successfully' });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create document', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New Document</DialogTitle>
          <DialogDescription>
            Create a new document from order data or upload manually.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="commercial_invoice">Commercial Invoice</SelectItem>
                      <SelectItem value="packing_list">Packing List</SelectItem>
                      <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
                      <SelectItem value="airway_bill">Air Waybill</SelectItem>
                      <SelectItem value="shipping_instructions">Shipping Instructions</SelectItem>
                      <SelectItem value="certificate_of_origin">Certificate of Origin</SelectItem>
                      <SelectItem value="insurance_certificate">Insurance Certificate</SelectItem>
                      <SelectItem value="proof_of_delivery">Proof of Delivery</SelectItem>
                      <SelectItem value="customs_declaration">Customs Declaration</SelectItem>
                      <SelectItem value="inspection_certificate">Inspection Certificate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Commercial Invoice - Shanghai to LA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Order</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No linked order</SelectItem>
                      {orders?.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.order_number} - {order.commodity_description || 'No description'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="country_of_origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country of Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="China" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="incoterms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incoterms</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incoterms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FOB">FOB</SelectItem>
                      <SelectItem value="CIF">CIF</SelectItem>
                      <SelectItem value="EXW">EXW</SelectItem>
                      <SelectItem value="DDP">DDP</SelectItem>
                      <SelectItem value="DAP">DAP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDocument.isPending}>
                {createDocument.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Document
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
