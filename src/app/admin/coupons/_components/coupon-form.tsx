'use client';

import { useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Save, CalendarIcon, Truck, Sparkles, AlertCircle } from 'lucide-react';
import type { Coupon } from '../page';

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres.')
    .refine((val) => val.toUpperCase() === val, 'El código debe estar en mayúsculas.'),
  description: z.string().min(3, 'La descripción es requerida.'),
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
  discountValue: z.coerce.number().min(0, 'El valor no puede ser negativo.'),
  minPurchase: z.coerce.number().min(0).optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
  usageLimitType: z.enum(['unlimited', 'single_use', 'custom']).default('unlimited'),
  usageLimit: z.coerce.number().min(0).optional(),
  onePerUser: z.boolean().default(false),
}).refine((data) => {
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'El porcentaje no puede ser mayor que 100.',
  path: ['discountValue'],
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
  };

  const initialLimitType: 'unlimited' | 'single_use' | 'custom' =
    coupon?.usageLimit === 1
      ? 'single_use'
      : coupon?.usageLimit && coupon.usageLimit > 1
      ? 'custom'
      : 'unlimited';

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
      usageLimitType: initialLimitType,
      usageLimit: coupon?.usageLimit || 0,
      onePerUser: coupon?.onePerUser || false,
    },
  });

  const discountType = form.watch('discountType');
  const usageLimitType = form.watch('usageLimitType');

  const handleSubmit = (values: CouponFormValues) => {
    let finalUsageLimit = 0;
    if (values.usageLimitType === 'single_use') {
      finalUsageLimit = 1;
    } else if (values.usageLimitType === 'custom') {
      finalUsageLimit = Number(values.usageLimit) || 1;
    } else {
      finalUsageLimit = 0; // unlimited
    }

    const dataToSave = {
      code: values.code.trim().toUpperCase(),
      description: values.description.trim(),
      discountType: values.discountType,
      discountValue: values.discountType === 'free_shipping' ? 0 : Number(values.discountValue),
      minPurchase: Number(values.minPurchase) || 0,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      endDate: values.endDate ? values.endDate.toISOString() : null,
      isActive: values.isActive,
      usageLimit: finalUsageLimit,
      onePerUser: values.onePerUser,
    };

    onSave(dataToSave as unknown as Omit<Coupon, 'id' | 'usageCount'>);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cupón</CardTitle>
            <CardDescription>Define el código, la descripción y el beneficio que ofrece (porcentaje, cantidad fija o envío gratis).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código del Cupón</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="EJEMPLO: ENVIOGRATIS24, VIP10"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="font-mono uppercase font-bold"
                    />
                  </FormControl>
                  <FormDescription>Código que el cliente introducirá en el checkout (siempre en mayúsculas).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Envío gratis en pedidos superiores a 20€" />
                  </FormControl>
                  <FormDescription>Descripción descriptiva para tu control interno en el panel.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Beneficio</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val === 'free_shipping') {
                          form.setValue('discountValue', 0);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentaje de Descuento (%)</SelectItem>
                        <SelectItem value="fixed">Cantidad Fija de Descuento (€)</SelectItem>
                        <SelectItem value="free_shipping">🚚 Envío Gratis (100% de portes bonificados)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {discountType === 'free_shipping' ? (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3.5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">Cupón de Envío Gratis</p>
                    <p className="text-muted-foreground">
                      Bonificará el 100% del coste de transporte calculado por Packlink PRO.
                    </p>
                  </div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {discountType === 'percentage' ? 'Porcentaje (%)' : 'Valor en Céntimos (€)'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        {discountType === 'percentage'
                          ? 'Introduce el porcentaje (ej: 10 para 10% de descuento)'
                          : 'Introduce el importe en céntimos (ej: 500 para 5.00€)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* LÍMITES Y USOS */}
        <Card>
          <CardHeader>
            <CardTitle>Límites de Uso y Reglas</CardTitle>
            <CardDescription>
              Configura si el cupón es de uso único, tiene un número máximo de usos o es ilimitado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="usageLimitType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Tipo de Disponibilidad / Límite de Usos</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('unlimited');
                        form.setValue('usageLimit', 0);
                      }}
                      className={cn(
                        'flex flex-col items-start p-3.5 rounded-lg border-2 text-left transition-all',
                        field.value === 'unlimited'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border hover:border-primary/40 bg-card'
                      )}
                    >
                      <span className="font-semibold text-sm">Ilimitado</span>
                      <span className="text-xs text-muted-foreground mt-1">Sin límite de veces. Se puede usar siempre mientras esté activo.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('single_use');
                        form.setValue('usageLimit', 1);
                      }}
                      className={cn(
                        'flex flex-col items-start p-3.5 rounded-lg border-2 text-left transition-all',
                        field.value === 'single_use'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border hover:border-primary/40 bg-card'
                      )}
                    >
                      <span className="font-semibold text-sm">Uso Único Global</span>
                      <span className="text-xs text-muted-foreground mt-1">Solo 1 canje en toda la tienda. El primer cliente que lo use lo agota.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('custom');
                        if (!form.getValues('usageLimit') || form.getValues('usageLimit') === 1) {
                          form.setValue('usageLimit', 10);
                        }
                      }}
                      className={cn(
                        'flex flex-col items-start p-3.5 rounded-lg border-2 text-left transition-all',
                        field.value === 'custom'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border hover:border-primary/40 bg-card'
                      )}
                    >
                      <span className="font-semibold text-sm">Hasta un número de usos</span>
                      <span className="text-xs text-muted-foreground mt-1">Define un cupo máximo de canjes (ej: los primeros 20 o 50 pedidos).</span>
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {usageLimitType === 'custom' && (
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem className="rounded-lg border p-4 bg-muted/20">
                    <FormLabel>Número Máximo de Usos Totales</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} placeholder="Ej: 50" />
                    </FormControl>
                    <FormDescription>
                      El cupón se desactivará automáticamente cuando alcance este número de canjes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="onePerUser"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">Un solo uso por cliente</FormLabel>
                    <FormDescription>
                      Si se activa, cada usuario registrado solo podrá canjear este cupón una única vez en su cuenta.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minPurchase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compra Mínima Requerida (en céntimos)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} placeholder="0" />
                  </FormControl>
                  <FormDescription>
                    Subtotal mínimo del carrito necesario para aplicar el cupón. Pon 0 para que no requiera compra mínima (ej: 2000 = 20.00€).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Válido desde ya</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>A partir de qué día se puede empezar a canjear.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin / Caducidad (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Sin fecha de caducidad</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Día en que el cupón deja de ser válido.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">Cupón Activo</FormLabel>
                    <FormDescription>
                      Los clientes solo podrán aplicar el código si está activo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSaving} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cupón'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
