'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Save, CalendarIcon } from 'lucide-react';
import type { Coupon } from '../page';

const couponSchema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres.').refine(val => val.toUpperCase() === val, "El código debe estar en mayúsculas."),
  description: z.string().min(5, 'La descripción es requerida.'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().positive('El valor debe ser positivo.'),
  minPurchase: z.coerce.number().min(0).optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
  usageLimit: z.coerce.number().min(0).optional(),
  onePerUser: z.boolean().default(false), // Nuevo campo
}).refine(data => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: "El porcentaje no puede ser mayor que 100.",
    path: ["discountValue"],
});


type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon;
  onSave: (data: Omit<Coupon, 'id' | 'usageCount'>) => void;
  isSaving: boolean;
}

export default function CouponForm({ coupon, onSave, isSaving }: CouponFormProps) {

  // Helper to parse date strings from Firestore
  const parseDate = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  }
  
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || '',
      description: coupon?.description || '',
      discountType: coupon?.discountType || 'percentage',
      discountValue: coupon?.discountValue || 0,
      minPurchase: coupon?.minPurchase || 0,
      startDate: parseDate(coupon?.startDate),
      endDate: parseDate(coupon?.endDate),
      isActive: coupon?.isActive !== false,
      usageLimit: coupon?.usageLimit || 0,
      onePerUser: coupon?.onePerUser || false,
    },
  });

  const handleSubmit = (values: CouponFormValues) => {
    const dataToSave = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
    };
    onSave(dataToSave as Omit<Coupon, 'id' | 'usageCount'>);
  };
  
  const discountType = form.watch('discountType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Información del Cupón</CardTitle>
                <CardDescription>Define el código y el tipo de descuento que se aplicará.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Código del Cupón</FormLabel>
                        <FormControl><Input {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                        <FormDescription>El código que los clientes usarán. Se guardará en mayúsculas.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormDescription>Descripción interna para tu referencia.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="discountType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Descuento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="percentage">Porcentaje</SelectItem>
                                    <SelectItem value="fixed">Cantidad Fija</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="discountValue" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor del Descuento</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormDescription>
                                {discountType === 'percentage' ? 'Porcentaje (ej. 10 para 10%)' : 'En céntimos (ej. 500 para 5.00€)'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </CardContent>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>Reglas y Restricciones</CardTitle>
                <CardDescription>Establece las condiciones para que el cupón sea válido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={form.control} name="minPurchase" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Compra Mínima (en céntimos)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription>El subtotal mínimo para aplicar el cupón. 0 para ninguno.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="usageLimit" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Límite de Usos Totales</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription>Número máximo de veces que este cupón puede ser usado. 0 para ilimitado.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="onePerUser" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Un solo uso por cliente</FormLabel>
                            <FormDescription>Si se activa, cada cliente solo podrá usar este cupón una vez.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus/>
                            </PopoverContent></Popover>
                             <FormDescription>Opcional. El cupón será válido a partir de esta fecha.</FormDescription>
                            <FormMessage />
                        </FormItem>
                     )} />
                      <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Fin</FormLabel>
                             <Popover><PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} initialFocus/>
                            </PopoverContent></Popover>
                            <FormDescription>Opcional. El cupón expirará al final de este día.</FormDescription>
                            <FormMessage />
                        </FormItem>
                     )} />
                </div>
                 <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Cupón Activo</FormLabel>
                            <FormDescription>Solo los cupones activos pueden ser utilizados por los clientes.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar Cupón'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
