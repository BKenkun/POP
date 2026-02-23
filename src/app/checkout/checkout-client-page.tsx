'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingBag,
  Loader2,
  Home,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Lock,
  UserPlus,
  CreditCard,
  Ticket,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Order } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Coupon } from '@/app/admin/coupons/page';
import { useTranslation } from '@/context/language-context';
import { QuantitySelector } from '@/components/quantity-selector';
import { createHilowOrder } from '@/app/actions/hilow';

interface Address {
  id: string;
  alias: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const getCheckoutSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(3, t('checkout.form_errors.name_required')),
    email: z.string().email(t('checkout.form_errors.email_invalid')),
    phone: z.string().min(9, t('checkout.form_errors.phone_required')),
    street: z.string().min(5, t('checkout.form_errors.street_required')),
    city: z.string().min(2, t('checkout.form_errors.city_required')),
    state: z.string().min(2, t('checkout.form_errors.state_required')),
    postalCode: z.string().min(3, t('checkout.form_errors.zip_required')),
    country: z.string().min(2, t('checkout.form_errors.country_required')),
    saveAddress: z.boolean().default(false),
  });

type CheckoutFormValues = z.infer<ReturnType<typeof getCheckoutSchema>>;

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('firebasestorage.googleapis.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

const Stepper = ({ currentStep, t }: { currentStep: number; t: (key: string) => string; }) => {
  const steps = [
    { number: 1, name: t('checkout.stepper.cart') || 'Cart' },
    { number: 2, name: t('checkout.stepper.details') || 'Details' },
    { number: 3, name: t('checkout.stepper.review') || 'Review' },
  ];
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div className={cn('flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all', currentStep >= step.number ? 'bg-primary border-primary text-primary-foreground' : 'border-muted text-muted-foreground bg-muted/50')}>
              {step.number}
            </div>
            <p className={cn('mt-2 text-sm font-medium', currentStep >= step.number ? 'text-primary' : 'text-muted-foreground')}>
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && <div className={cn('flex-1 h-1 mx-4 rounded-full transition-all', currentStep > index + 1 ? 'bg-primary' : 'bg-muted')}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function CheckoutClientPage() {
  const { t } = useTranslation();
  const { cartItems, cartTotal, cartCount, removeFromCart, updateQuantity, volumeDiscount } = useCart();
  const { user, loading: isUserLoading, userDoc } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(getCheckoutSchema(t)),
    defaultValues: { name: '', email: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Spain', saveAddress: false },
  });

  const formValues = form.watch();

  const finalTotals = useMemo(() => {
    const subtotal = cartTotal;
    const subtotalWithDiscounts = subtotal - volumeDiscount - couponDiscount;
    const total = subtotalWithDiscounts;
    return { subtotal, total, priceInCents: Math.round(total) };
  }, [cartTotal, volumeDiscount, couponDiscount]);

  useEffect(() => {
    if (user && userDoc) {
      const userAddresses: Address[] = userDoc.addresses || [];
      const defaultAddress = userAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) handleAddressSelection(defaultAddress.id, userAddresses);
      else if (userAddresses.length > 0) handleAddressSelection(userAddresses[0].id, userAddresses);
      else form.setValue('email', user.email || '');
    } else if (user) {
      form.setValue('email', user.email || '');
    }
  }, [user, userDoc]);

  const handleAddressSelection = (addressId: string, currentAddresses: Address[] = userDoc?.addresses || []) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      form.reset({ ...form.getValues(), email: user?.email || '', name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Spain' });
    } else {
      const addr = currentAddresses.find((a) => a.id === addressId);
      if (addr) {
        form.setValue('name', addr.name);
        form.setValue('phone', addr.phone);
        form.setValue('street', addr.street);
        form.setValue('city', addr.city);
        form.setValue('state', addr.state || addr.city);
        form.setValue('postalCode', addr.postalCode);
        form.setValue('country', addr.country);
        form.setValue('email', user?.email || '');
      }
    }
  };

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !user) return;
    setCouponLoading(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error(t('checkout.toasts.coupon_error_invalid'));
      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
      if (!coupon.isActive) throw new Error(t('checkout.toasts.coupon_error_inactive'));
      
      let discount = coupon.discountType === 'percentage' ? (cartTotal * coupon.discountValue) / 100 : coupon.discountValue;
      setAppliedCoupon(coupon);
      setCouponDiscount(Math.round(discount));
      toast({ title: t('checkout.toasts.coupon_applied_title'), description: t('checkout.toasts.coupon_applied_desc', { discount: formatPrice(discount) }) });
    } catch (e: any) {
      toast({ title: t('checkout.toasts.coupon_error_title'), description: e.message, variant: 'destructive' });
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, user, cartTotal, t, toast]);

  const onFinalSubmit = async (data: CheckoutFormValues) => {
    if (!user) return;
    setLoading(true);
    const uniqueId = `CPO_${user.uid}_${Date.now()}`;
    
    try {
        const localOrderRef = doc(db, 'users', user.uid, 'orders', uniqueId);
        const localOrderData: Omit<Order, 'id'> = {
            userId: user.uid,
            items: cartItems.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, imageUrl: item.imageUrl })),
            total: finalTotals.total,
            customerName: data.name,
            customerEmail: data.email,
            shippingAddress: { line1: data.street, line2: null, city: data.city, state: data.state, postal_code: data.postalCode, country: data.country, phone: data.phone },
            status: 'pending_payment',
            paymentMethod: 'hilow',
            createdAt: serverTimestamp() as any,
            ...(appliedCoupon && { coupon: { code: appliedCoupon.code, discount: couponDiscount }})
        };
        await setDoc(localOrderRef, localOrderData);

        const hilowResult = await createHilowOrder(uniqueId, finalTotals.priceInCents, cartItems.map(item => `${item.quantity}x ${item.name}`).join(', '), false);
        if (!hilowResult.success || !hilowResult.checkoutUrl) throw new Error(hilowResult.message || 'Could not start payment.');
        window.location.href = hilowResult.checkoutUrl;
    } catch (e: any) {
        toast({ title: t('checkout.toasts.order_error_title'), description: e.message, variant: 'destructive' });
        setLoading(false);
    }
  };

  if (isUserLoading && !user) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-headline text-primary mb-8 text-center font-bold">{t('checkout.title')}</h1>
      <Stepper currentStep={step} t={t} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinalSubmit)}>
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>{t('checkout.confirm_cart_title')}</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 rounded border overflow-hidden"><Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" /></div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <QuantitySelector quantity={item.quantity} onQuantityChange={(q) => updateQuantity(item.id, q)} maxStock={item.stock} />
                    </div>
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="bg-muted/50 flex-col gap-2">
                <div className="flex justify-between w-full"><span>{t('checkout.subtotal')}</span><span>{formatPrice(cartTotal)}</span></div>
                {volumeDiscount > 0 && <div className="flex justify-between w-full text-destructive"><span>{t('cart.volume_discount')}</span><span>-{formatPrice(volumeDiscount)}</span></div>}
                <Separator />
                <div className="flex justify-between w-full font-bold text-lg"><span>Total</span><span>{formatPrice(finalTotals.total)}</span></div>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>{t('checkout.user_details_title')}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {!user ? (
                  <Alert variant="destructive"><Lock className="h-4 w-4" /><AlertTitle>Login Required</AlertTitle><AlertDescription>Please log in to continue.</AlertDescription></Alert>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('checkout.fullname_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('checkout.phone_label')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>{t('checkout.street_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>{t('checkout.city_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>{t('checkout.zip_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>{t('checkout.review_title')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                    <Button type="button" onClick={handleApplyCoupon} disabled={couponLoading}>{couponLoading ? <Loader2 className="animate-spin" /> : 'Apply'}</Button>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(finalTotals.subtotal)}</span></div>
                    <div className="flex justify-between font-bold text-xl"><span>Total</span><span className="text-primary">{formatPrice(finalTotals.total)}</span></div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
                  Pay Securely by Card
                </Button>
              </CardFooter>
            </Card>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="mr-2" /> Back</Button>}
            {step < 3 && <Button type="button" onClick={() => setStep(step + 1)}>Continue</Button>}
          </div>
        </form>
      </Form>
    </div>
  );
}
