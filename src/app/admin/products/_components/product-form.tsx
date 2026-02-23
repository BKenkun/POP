'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/rich-text-editor';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';

const productSchema = z.object({
  name: z.string().min(3, 'Name is required.'),
  sku: z.string().min(1, 'SKU is required.'),
  active: z.boolean().default(true),
  price: z.coerce.number().int().min(0, 'Price must be positive.'),
  originalPrice: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  productDetails: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  composition: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL.'),
  imageHint: z.string().optional(),
  galleryImages: z.string().optional(),
  tags: z.string().optional(),
  internalTags: z.string().optional(),
  web: z.string().optional(),
  url: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  cost: z.coerce.number().int().min(0, 'Cost cannot be negative.').optional(),
  includesVat: z.boolean().default(true),
  vatPercentage: z.coerce.number().min(0).max(100).optional(),
  offerStartDate: z.date().optional().nullable(),
  offerEndDate: z.date().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Partial<Product>;
  onSave: (data: Product) => void;
  isSaving: boolean;
}

export default function ProductForm({ product, onSave, isSaving }: ProductFormProps) {

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      active: product?.active === undefined ? true : product.active,
      price: product?.price || 0,
      originalPrice: product?.originalPrice || undefined,
      stock: product?.stock || 0,
      description: product?.description || '',
      longDescription: product?.longDescription || '',
      productDetails: product?.productDetails || '',
      brand: product?.brand || '',
      size: product?.size || '',
      composition: product?.composition || '',
      imageUrl: product?.imageUrl || '',
      imageHint: product?.imageHint || 'product image',
      galleryImages: product?.galleryImages?.join(', ') || '',
      tags: product?.tags?.join(', ') || '',
      internalTags: product?.internalTags?.join(', ') || '',
      web: product?.web || '',
      url: product?.url || '',
      cost: product?.cost || 0,
      includesVat: product?.includesVat === undefined ? true : product.includesVat,
      vatPercentage: product?.vatPercentage || 21,
      offerStartDate: product?.offerStartDate ? parseISO(product.offerStartDate) : undefined,
      offerEndDate: product?.offerEndDate ? parseISO(product.offerEndDate) : undefined,
    },
  });

  const offerPrice = form.watch('price');
  const originalPrice = form.watch('originalPrice');
  const savings = originalPrice && offerPrice ? originalPrice - offerPrice : 0;
  const savingsPercentage = originalPrice && savings > 0 ? (savings / originalPrice) * 100 : 0;

  const handleSubmit = (values: ProductFormValues) => {
    const finalData: Product = {
      id: product?.id || `prod_${Date.now()}`,
      ...values,
      originalPrice: values.originalPrice || undefined,
      price: values.price,
      offerStartDate: values.offerStartDate ? values.offerStartDate.toISOString() : null,
      offerEndDate: values.offerEndDate ? values.offerEndDate.toISOString() : null,
      imageHint: values.imageHint || 'product image',
      galleryImages: values.galleryImages?.split(',').map(s => s.trim()).filter(Boolean) || [],
      tags: values.tags?.split(',').map(s => s.trim()).filter(Boolean) || [],
      internalTags: values.internalTags?.split(',').map(s => s.trim()).filter(Boolean) || [],
    };
    onSave(finalData);
  };
  
  const handleOfferPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const salePrice = e.target.valueAsNumber || 0;
    const currentPrice = form.getValues('price');
    const currentOriginalPrice = form.getValues('originalPrice');

    if (salePrice > 0 && !currentOriginalPrice) {
      form.setValue('originalPrice', currentPrice);
    }
    form.setValue('price', salePrice);
    if (salePrice <= 0 && currentOriginalPrice) {
      form.setValue('price', currentOriginalPrice);
      form.setValue('originalPrice', undefined);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Main Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="longDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long Description</FormLabel>
                    <FormDescription>Rich text for detailed specs.</FormDescription>
                    <FormControl>
                        <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Inventory & Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                 <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={originalPrice ? 'originalPrice' : 'price'} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Price (cents)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price (cents)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Optional" value={originalPrice ? field.value : ''} onChange={handleOfferPriceChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 {savings > 0 && (
                  <Alert variant="default" className="bg-green-50 border-green-200">
                      <AlertCircle className="h-4 w-4 !text-green-600" />
                      <AlertDescription className="text-green-700">
                          Savings: <span className="font-bold">{(savings / 100).toFixed(2)}€</span> ({savingsPercentage.toFixed(0)}%)
                      </AlertDescription>
                  </Alert>
                )}
                <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Categorization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="internalTags" render={({ field }) => (
                    <FormItem><FormLabel>Internal Tags</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Comma separated: novelty, offer, bestseller</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
