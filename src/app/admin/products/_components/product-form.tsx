
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
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the schema outside the component
const productSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  sku: z.string().min(1, 'El SKU es requerido.'),
  active: z.boolean().default(true),
  price: z.coerce.number().int().min(0, 'El precio debe ser un número positivo.'),
  originalPrice: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  productDetails: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  composition: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida.'),
  imageHint: z.string().optional(),
  galleryImages: z.string().optional(),
  tags: z.string().optional(),
  internalTags: z.string().optional(),
  web: z.string().optional(),
  url: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
  cost: z.coerce.number().int().min(0, 'El coste no puede ser negativo.').optional(),
  includesVat: z.boolean().default(true),
  vatPercentage: z.coerce.number().min(0, 'El IVA no puede ser negativo.').max(100, 'El IVA no puede ser mayor que 100.').optional(),
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
      web: product?.web || (product?.internalTags?.includes('popper') ? 'popper' : ''),
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
    // Convert comma-separated strings back to arrays for the final object
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
      // If setting a sale price and there's no original price,
      // move the current standard price to originalPrice
      form.setValue('originalPrice', currentPrice);
    }
    form.setValue('price', salePrice);
    if (salePrice <= 0 && currentOriginalPrice) {
      // If clearing the sale price, restore the original price
      form.setValue('price', currentOriginalPrice);
      form.setValue('originalPrice', undefined);
    }
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
                    <FormLabel>Descripción Larga</FormLabel>
                    <FormDescription>Editor de texto enriquecido para descripciones detalladas de productos.</FormDescription>
                    <FormControl>
                        <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                    control={form.control} name="productDetails" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Detalles del Producto</FormLabel>
                            <FormDescription>Muestra una lista de características. Cada detalle en una nueva línea (Clave: Valor). Ej: "Aroma: Frutal".</FormDescription>
                            <FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )} 
                />
              </CardContent>
            </Card>
             <Card className="border-primary/50">
                <CardHeader><CardTitle>Imágenes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL de la Imagen Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="imageHint" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pista de la Imagen (para IA)</FormLabel>
                            <FormDescription>Una o dos palabras que describan la imagen. Ej: "yellow bottle", "black bottle".</FormDescription>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
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
              <CardHeader><CardTitle>Inventario y Precios</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Número de Referencia)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Debe ser único para cada producto. Usa 'P' para Poppers y 'C' para CBD.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={originalPrice ? 'originalPrice' : 'price'} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Estándar (en céntimos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.valueAsNumber || 0;
                            if (originalPrice) {
                              form.setValue('originalPrice', value);
                            } else {
                              form.setValue('price', value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de Oferta (en céntimos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Opcional"
                          value={originalPrice ? field.value : ''}
                          onChange={handleOfferPriceChange} 
                        />
                      </FormControl>
                      <FormDescription>Si se establece, el precio estándar se mostrará tachado.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 {savings > 0 && (
                  <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                      <AlertCircle className="h-4 w-4 !text-green-600" />
                      <AlertDescription className="text-green-700 dark:text-green-300">
                          Ahorro del cliente: <span className="font-bold">{(savings / 100).toFixed(2)}€</span> ({savingsPercentage.toFixed(0)}%)
                      </AlertDescription>
                  </Alert>
                )}
                <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Disponible</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Si es 0, se mostrará como "Agotado".</FormDescription><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
            
            <Card className="border-primary/50">
              <CardHeader><CardTitle>Gestión de Ofertas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="offerStartDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Duración de la Oferta</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value && form.getValues('offerEndDate') ? (
                                        <>
                                            {format(field.value, "LLL dd, y", { locale: es })} -{" "}
                                            {format(form.getValues('offerEndDate')!, "LLL dd, y", { locale: es })}
                                        </>
                                    ) : field.value ? (
                                        format(field.value, "LLL dd, y", { locale: es })
                                    ) : (
                                        <span>Selecciona un rango de fechas</span>
                                    )}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={field.value}
                                selected={{ from: field.value!, to: form.getValues('offerEndDate') }}
                                onSelect={(range: DateRange | undefined) => {
                                    form.setValue('offerStartDate', range?.from)
                                    form.setValue('offerEndDate', range?.to)
                                }}
                                numberOfMonths={2}
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Opcional. Si se establece, la oferta solo será válida durante este período.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
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
