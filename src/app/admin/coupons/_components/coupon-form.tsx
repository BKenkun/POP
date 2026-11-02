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
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Save, CalendarIcon, Truck, Sparkles, AlertCircle } from 'lucide-react';
import type { Coupon } from '../page';

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must have at least 3 characters.')
    .refine((val) => val.toUpperCase() === val, 'Code must be uppercase.'),
  description: z.string().min(3, 'Description is required.'),
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
  discountValue: z.coerce.number().min(0, 'Value cannot be negative.'),
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
  message: 'Percentage cannot be greater than 100.',
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
            <CardTitle>Coupon Information</CardTitle>
            <CardDescription>Define coupon code, description, and the benefit it offers (percentage, fixed discount, or free shipping).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="EXAMPLE: FREESHIP24, VIP10"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="font-mono uppercase font-bold"
                    />
                  </FormControl>
                  <FormDescription>Code customers enter at checkout (always in uppercase).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g., Free shipping on orders over €20" />
                  </FormControl>
                  <FormDescription>Internal descriptive label for admin dashboard tracking.</FormDescription>
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
                    <FormLabel>Benefit Type</FormLabel>
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
                        <SelectItem value="percentage">Percentage Discount (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount Discount (€)</SelectItem>
                        <SelectItem value="free_shipping">🚚 Free Shipping (100% delivery cost covered)</SelectItem>
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
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">Free Shipping Coupon</p>
                    <p className="text-muted-foreground">
                      Covers 100% of the shipping cost calculated via Packlink PRO.
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
                        {discountType === 'percentage' ? 'Percentage (%)' : 'Value in Cents (€)'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        {discountType === 'percentage'
                          ? 'Enter the percentage (e.g. 10 for 10% off)'
                          : 'Enter amount in cents (e.g. 500 for €5.00)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* USAGE LIMITS & RULES */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits & Rules</CardTitle>
            <CardDescription>
              Configure whether the coupon is single-use, has a max redemption limit, or is unlimited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="usageLimitType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Availability Type / Usage Limit</FormLabel>
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
                      <span className="font-semibold text-sm">Unlimited</span>
                      <span className="text-xs text-muted-foreground mt-1">No limit. Can be used any number of times while active.</span>
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
                      <span className="font-semibold text-sm">Single Use (Global)</span>
                      <span className="text-xs text-muted-foreground mt-1">Only 1 redemption store-wide. First customer to use it redeems it.</span>
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
                      <span className="font-semibold text-sm">Max Redemptions</span>
                      <span className="text-xs text-muted-foreground mt-1">Set a total redemption cap (e.g. first 20 or 50 orders).</span>
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
                    <FormLabel>Maximum Total Redemptions</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} placeholder="E.g., 50" />
                    </FormControl>
                    <FormDescription>
                      The coupon will automatically deactivate once it reaches this number of uses.
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
                    <FormLabel className="text-base font-medium">One use per customer</FormLabel>
                    <FormDescription>
                      If enabled, each registered customer can only redeem this coupon once.
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
                  <FormLabel>Minimum Purchase Required (in cents)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} placeholder="0" />
                  </FormControl>
                  <FormDescription>
                    Minimum cart subtotal required to apply the coupon. Set 0 for no minimum (e.g. 2000 = €20.00).
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
                    <FormLabel>Start Date (Optional)</FormLabel>
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
                              format(field.value, 'PPP')
                            ) : (
                              <span>Valid immediately</span>
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
                    <FormDescription>Starting date when the coupon becomes active.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date (Optional)</FormLabel>
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
                              format(field.value, 'PPP')
                            ) : (
                              <span>No expiration date</span>
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
                    <FormDescription>Date after which the coupon expires.</FormDescription>
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
                    <FormLabel className="text-base font-medium">Active Coupon</FormLabel>
                    <FormDescription>
                      Customers can only apply this code if active.
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
            {isSaving ? 'Saving...' : 'Save Coupon'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
