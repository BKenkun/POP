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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cbdProducts } from '@/lib/cbd-products';

// Define the schema outside the component
const productSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  sku: z.string().min(1, 'El SKU es requerido.'),
  active: z.boolean().default(true),
  price: z.coerce.number().int().positive('El precio debe ser un número positivo (en céntimos).'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  productDetails: z.string().optional(),
  brand: z.string().optional(),
  composition: z.string().optional(),
  size: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida.'),
  galleryImages: z.string().optional(),
  tags: z.string().optional(),
  internalTags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (data: Product) => void;
}

export default function ProductForm({ product, onSave }: ProductFormProps) {
  // Create a refined schema for uniqueness validation
  const productSchemaWithUniqueness = productSchema.refine(
    (data) => {
        // Check if there's any other product with the same SKU
        const isSkuDuplicate = cbdProducts.some(p => p.sku === data.sku && p.id !== product?.id);
        return !isSkuDuplicate;
    },
    {
      message: "Este SKU ya está en uso por otro producto.",
      path: ["sku"], // Apply the error to the 'sku' field
    }
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchemaWithUniqueness),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      active: product?.active === undefined ? true : product.active,
      price: product?.price || 0,
      stock: product?.stock || 0,
      description: product?.description || '',
      longDescription: product?.longDescription || '',
      productDetails: product?.productDetails || '',
      brand: product?.brand || '',
      composition: product?.composition || '',
      size: product?.size || '',
      imageUrl: product?.imageUrl || '',
      galleryImages: product?.galleryImages?.join(', ') || '',
      tags: product?.tags?.join(', ') || '',
      internalTags: product?.internalTags?.join(', ') || '',
    },
  });

  const handleSubmit = (values: ProductFormValues) => {
    // Convert comma-separated strings back to arrays for the final object
    const finalData: Product = {
      id: product?.id || `prod_${Date.now()}`, // Keep existing ID or generate a new one
      ...values,
      galleryImages: values.galleryImages?.split(',').map(s => s.trim()).filter(Boolean) || [],
      tags: values.tags?.split(',').map(s => s.trim()).filter(Boolean) || [],
      internalTags: values.internalTags?.split(',').map(s => s.trim()).filter(Boolean) || [],
      imageHint: product?.imageHint || 'product image', // Keep existing or default
    };
    onSave(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Información Principal</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre del Producto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descripción Corta</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="longDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Larga</FormLabel>
                    <FormDescription>Puedes usar etiquetas HTML básicas para dar formato.</FormDescription>
                    <FormControl><Textarea rows={8} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Imágenes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL de la Imagen Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="galleryImages" render={({ field }) => (
                        <FormItem>
                            <FormLabel>URLs de la Galería (separadas por comas)</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
          </div>
          
          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Estado del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField control={form.control} name="active" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Producto Activo</FormLabel>
                                <FormDescription>Si está inactivo, se considerará "Archivado" y no se mostrará en la tienda.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Inventario y Precio</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Número de Referencia)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Debe ser único para cada producto.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio (en céntimos)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Disponible</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Organización</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="size" render={({ field }) => (
                    <FormItem><FormLabel>Tamaño</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="composition" render={({ field }) => (
                    <FormItem><FormLabel>Composición</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Etiquetas y Detalles</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem><FormLabel>Etiquetas Visibles (separadas por comas)</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Ej: Nuevo, Edición Limitada</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="internalTags" render={({ field }) => (
                        <FormItem><FormLabel>Categorías Internas (separadas por comas)</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Ej: mas-vendido, oferta, accesorio</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="productDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Detalles del Producto (clave: valor)</FormLabel>
                            <FormDescription>Cada detalle en una nueva línea. Ej: "Aroma: Frutal".</FormDescription>
                            <FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Guardar Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}
