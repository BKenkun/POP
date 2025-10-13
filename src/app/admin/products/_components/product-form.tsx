
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
import { Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
  size: z.string().optional(),
  composition: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida.'),
  galleryImages: z.string().optional(),
  tags: z.string().optional(),
  internalTags: z.string().optional(),
  web: z.string().optional(), // Added for web portal filtering
  url: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
  // New accounting fields
  cost: z.coerce.number().int().min(0, 'El coste no puede ser negativo.').optional(),
  includesVat: z.boolean().default(true),
  vatPercentage: z.coerce.number().min(0, 'El IVA no puede ser negativo.').max(100, 'El IVA no puede ser mayor que 100.').optional(),
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
      stock: product?.stock || 0,
      description: product?.description || '',
      longDescription: product?.longDescription || '',
      productDetails: product?.productDetails || '',
      brand: product?.brand || '',
      size: product?.size || '',
      composition: product?.composition || '',
      imageUrl: product?.imageUrl || '',
      galleryImages: product?.galleryImages?.join(', ') || '',
      tags: product?.tags?.join(', ') || '',
      internalTags: product?.internalTags?.join(', ') || '',
      web: product?.internalTags?.includes('popper') ? 'popper' : '',
      url: product?.url || '',
      cost: product?.cost || 0,
      includesVat: product?.includesVat === undefined ? true : product.includesVat,
      vatPercentage: product?.vatPercentage || 21,
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
        <div className="space-y-6">
            <Card className="border-primary/50">
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
                    <FormLabel>Descripción Larga (HTML)</FormLabel>
                    <FormDescription>Permite añadir una descripción extensa con formato HTML, superando los límites de un solo campo de Stripe. Los fragmentos se unen en orden numérico (ej: long_description_1, _2...).</FormDescription>
                    <FormControl><Textarea rows={8} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
             <Card className="border-primary/50">
                <CardHeader><CardTitle>Imágenes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL de la Imagen Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="galleryImages" render={({ field }) => (
                        <FormItem>
                            <FormLabel>URLs de la Galería</FormLabel>
                            <FormDescription>Añade más imágenes a la vista detallada del producto, separadas por comas.</FormDescription>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            <Card className="border-primary/50">
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
            <Card className="border-primary/50">
              <CardHeader><CardTitle>Inventario y Precio</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Número de Referencia)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Debe ser único para cada producto. Usa 'P' para Poppers y 'C' para CBD.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio de Venta (en céntimos)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Disponible</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Si es 0, se mostrará como "Agotado".</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardHeader><CardTitle>Datos Económicos y Contabilidad</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="cost" render={({ field }) => (
                    <FormItem><FormLabel>Coste (en céntimos)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>El coste de adquisición del producto.</FormDescription><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="vatPercentage" render={({ field }) => (
                        <FormItem><FormLabel>Porcentaje de IVA (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="includesVat" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2">
                            <div className="space-y-0.5">
                                <FormLabel>¿Precio incluye IVA?</FormLabel>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/50">
              <CardHeader><CardTitle>Organización y Filtros</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="web" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portal Web</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormDescription>Define en qué portal aparecerá. Usar 'popper' para esta tienda o 'CBD' para la otra.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                 <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Agrupa productos por marca. Ejemplo: Rush</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="size" render={({ field }) => (
                    <FormItem><FormLabel>Tamaño</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Agrupa productos por volumen. Ejemplo: 10ml, 25ml</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="composition" render={({ field }) => (
                    <FormItem><FormLabel>Composición</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Agrupa productos por composición química. Ejemplo: Amilo, Pentilo</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            <Card className="border-primary/50">
                <CardHeader><CardTitle>Etiquetas y Detalles Adicionales</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem><FormLabel>Etiquetas Visibles</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Muestra insignias visuales en el producto. Separadas por comas. Ej: Nuevo, Edición Limitada</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="internalTags" render={({ field }) => (
                        <FormItem><FormLabel>Categorías Internas</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Controla dónde aparece el producto. Separadas por comas. Ej: novedad, mas-vendido, oferta, pack, accesorio, juguete</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="productDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Detalles del Producto</FormLabel>
                            <FormDescription>Muestra una lista de características. Cada detalle en una nueva línea (Clave: Valor). Ej: "Aroma: Frutal".</FormDescription>
                            <FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="url" render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL de Origen</FormLabel>
                            <FormControl><Input type="url" {...field} /></FormControl>
                            <FormDescription>Enlace al producto original en otra web (proveedor, etc.) para referencia interna.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
