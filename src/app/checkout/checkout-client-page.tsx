
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, ArrowLeft, Lock, UserPlus, CreditCard, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShippingAddress } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updateUser } from '@/app/actions/user-data';
import type { Coupon } from '@/app/admin/coupons/page';
import { useTranslation } from '@/context/language-context';
import { collection, query, where, getDocs } from 'firebase/firestore';


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

const getCheckoutSchema = (t: (key: string) => string) => z.object({
    name: z.string().min(3, t('checkout.form_errors.name_required')),
    email: z.string().email(t('checkout.form_errors.email_invalid')),
    phone: z.string().min(9, t('checkout.form_errors.phone_required')),
    street: z.string().min(5, t('checkout.form_errors.street_required')),
    city: z.string().min(2, t('checkout.form_errors.city_required')),
    state: z.string().min(2, t('checkout.form_errors.state_required')),
    postalCode: z.string().min(3, t('checkout.form_errors.zip_required')),
    country: z.string().min(2, t('checkout.form_errors.country_required')),
    saveAddress: z.boolean().default(false),
    useDifferentBilling: z.boolean().default(false),
    billing_name: z.string().optional(),
    billing_street: z.string().optional(),
    billing_city: z.string().optional(),
    billing_state: z.string().optional(),
    billing_postalCode: z.string().optional(),
    billing_country: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.useDifferentBilling) {
        if (!data.billing_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout.form_errors.billing_field_required'), path: ["billing_name"] });
        if (!data.billing_street) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout.form_errors.billing_field_required'), path: ["billing_street"] });
        if (!data.billing_city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout.form_errors.billing_field_required'), path: ["billing_city"] });
        if (!data.billing_state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout.form_errors.billing_field_required'), path: ["billing_state"] });
        if (!data.billing_postalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout.form_errors.billing_field_required'), path: ["billing_postalCode"] });
        if (!data.billing_country) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('checkout.form_errors.billing_field_required'), path: ["billing_country"] });
    }
});

type CheckoutFormValues = z.infer<ReturnType<typeof getCheckoutSchema>>;

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const Stepper = ({ currentStep, t }: { currentStep: number, t: (key: string) => string }) => {
    const steps = [
        { number: 1, name: t('checkout.stepper.cart') }, 
        { number: 2, name: t('checkout.stepper.details') }, 
        { number: 3, name: t('checkout.stepper.review') }
    ];
    return (
        <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
                 <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div className={cn("flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all", currentStep >= step.number ? "bg-primary border-primary text-primary-foreground" : "border-muted text-muted-foreground bg-muted/50")}>
                           {step.number}
                        </div>
                        <p className={cn("mt-2 text-sm font-medium", currentStep >= step.number ? "text-primary" : "text-muted-foreground")}>{step.name}</p>
                    </div>
                    {index < steps.length - 1 && <div className={cn("flex-1 h-1 mx-4 rounded-full transition-all", currentStep > index + 1 ? "bg-primary" : "bg-muted")}></div>}
                 </React.Fragment>
            ))}
        </div>
    );
};

export default function CheckoutClientPage() {
  const { t } = useTranslation();
  const { cartItems, cartTotal, cartCount } = useCart();
  const { user, loading: isUserLoading, userDoc, setUserDoc } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  
  const checkoutSchema = getCheckoutSchema(t);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
        name: '', email: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'España',
        saveAddress: false, useDifferentBilling: false 
    },
  });
  
  const formValues = form.watch();

  const finalTotals = useMemo(() => {
    const subtotal = cartTotal;
    const subtotalWithDiscounts = subtotal - couponDiscount;
    const shipping = 0; // Free shipping
    const total = subtotalWithDiscounts + shipping;
    return { subtotal, shipping, total, priceInCents: Math.round(total) };
  }, [cartTotal, couponDiscount]);

    useEffect(() => {
        if (!isUserLoading && cartCount === 0 && !loading) {
        router.push('/');
        }
    }, [cartCount, router, loading, isUserLoading]);
    
    useEffect(() => {
        if (user && userDoc) {
            const userAddresses: Address[] = userDoc.addresses || [];
            const defaultAddress = userAddresses.find(addr => addr.isDefault);
            if (defaultAddress) handleAddressSelection(defaultAddress.id, userAddresses);
            else if (userAddresses.length > 0) handleAddressSelection(userAddresses[0].id, userAddresses);
            else form.setValue('email', user.email || '');
        } else if (user) {
            form.setValue('email', user.email || '');
        }
    }, [user, userDoc, form]);
    
    const handleAddressSelection = (addressId: string, currentAddresses: Address[] = userDoc?.addresses || []) => {
        setSelectedAddressId(addressId);
        const email = user?.email || '';
        
        if (addressId === 'new') {
            form.reset({ ...form.getValues(), email, name: user?.displayName || user?.email?.split('@')[0] || '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'España', saveAddress: false });
        } else {
            const selectedAddr = currentAddresses.find(a => a.id === addressId);
            if (selectedAddr) {
                form.setValue('name', selectedAddr.name);
                form.setValue('phone', selectedAddr.phone);
                form.setValue('street', selectedAddr.street);
                form.setValue('city', selectedAddr.city);
                form.setValue('state', selectedAddr.state || selectedAddr.city);
                form.setValue('postalCode', selectedAddr.postalCode);
                form.setValue('country', selectedAddr.country);
                form.setValue('email', email); 
            }
        }
    };
    
    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !user) return;
        setCouponLoading(true);
        try {
            const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error(t('checkout.toasts.coupon_error_invalid'));
            }

            const couponDoc = querySnapshot.docs[0];
            const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
            const now = new Date();

            if (!coupon.isActive) throw new Error(t('checkout.toasts.coupon_error_inactive'));
            if (coupon.startDate && now < new Date(coupon.startDate)) throw new Error(t('checkout.toasts.coupon_error_not_yet_valid'));
            if (coupon.endDate && now > new Date(coupon.endDate)) throw new Error(t('checkout.toasts.coupon_error_expired'));
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new Error(t('checkout.toasts.coupon_error_limit_reached'));
            if (coupon.minPurchase && cartTotal < coupon.minPurchase) throw new Error(t('checkout.toasts.coupon_error_min_purchase', {price: formatPrice(coupon.minPurchase)}));
            
            if (coupon.onePerUser) {
                const ordersQuery = query(
                    collection(db, 'users', user.uid, 'orders'),
                    where('coupon.code', '==', coupon.code)
                );
                const pastOrdersSnap = await getDocs(ordersQuery);
                if (!pastOrdersSnap.empty) {
                    throw new Error(t('checkout.toasts.coupon_error_already_used'));
                }
            }
            
            let discount = 0;
            if (coupon.discountType === 'percentage') {
                discount = (cartTotal * coupon.discountValue) / 100;
            } else {
                discount = coupon.discountValue;
            }
            
            setAppliedCoupon(coupon);
            setCouponDiscount(Math.round(discount));
            toast({ title: t('checkout.toasts.coupon_applied_title'), description: t('checkout.toasts.coupon_applied_desc', {discount: formatPrice(discount)}) });

        } catch (error: any) {
            toast({ title: t('checkout.toasts.coupon_error_title'), description: error.message, variant: 'destructive' });
        } finally {
            setCouponLoading(false);
        }
    };


  const handleNextStep = async () => {
    let isValid = false;
    if (step === 1) {
        isValid = cartCount > 0;
        if (!isValid) toast({ title: t('cart.empty_title'), variant: "destructive" });
    } else if (step === 2) {
      if (!user) {
         toast({ title: t('checkout.toasts.login_required_title'), description: t('checkout.toasts.login_required_desc'), variant: "destructive" });
         router.push('/login?redirect=/checkout');
         return;
      }
      if (selectedAddressId !== 'new') isValid = true;
      else {
        const fieldsToValidate: (keyof CheckoutFormValues)[] = ['name', 'email', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
        if (form.getValues('useDifferentBilling')) fieldsToValidate.push('billing_name', 'billing_street', 'billing_city', 'billing_state', 'billing_postalCode', 'billing_country');
        isValid = await form.trigger(fieldsToValidate);
      }
    } else isValid = true;
    
    if (isValid) setStep(prev => prev + 1);
  };

  const handlePrevStep = () => { setStep(prev => prev - 1); };
  
  const onFinalSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast({ title: t('auth.login_title'), description: t('checkout.toasts.login_required_desc'), variant: 'destructive' });
      setStep(2);
      return;
    }
    setLoading(true);
    
    // The orderId is now crucial for tracking, but we won't create the order document yet.
    const orderId = `order_${user.uid}_${Date.now()}`;

    // We will now pass all necessary data to the purchase API.
    // The webhook will use this data later to create the order.
    const purchasePayload = {
      orderId,
      cartItems: cartItems.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, imageUrl: item.imageUrl })),
      total: finalTotals.total,
      priceInCents: finalTotals.priceInCents,
      customerName: data.name,
      customerEmail: data.email,
      shippingAddress: { line1: data.street, line2: null, city: data.city, state: data.state, postal_code: data.postalCode, country: data.country, phone: data.phone } as ShippingAddress,
      billingDetails: data.useDifferentBilling ? { name: data.billing_name, street: data.billing_street, city: data.billing_city, state: data.billing_state, postalCode: data.billing_postalCode, country: data.billing_country } : null,
      coupon: appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : null,
      productName: `Pedido de ${cartCount} productos`,
      userId: user.uid,
    };
    
    try {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchasePayload),
        });
        
        const { checkoutUrl, error } = await response.json();
        
        if (error) {
            throw new Error(error);
        }

        if (checkoutUrl) {
            // Save new address if needed, before redirecting
            if (data.saveAddress && selectedAddressId === 'new') {
                const addressToSave = { alias: `${t('account.addresses_title')} ${userDoc?.addresses?.length + 1 || 1}`, name: data.name, phone: data.phone, street: data.street, city: data.city, state: data.state, postalCode: data.postalCode, country: data.country };
                const result = await updateUser('add-address', addressToSave);
                if (result.success && result.user) {
                    setUserDoc(result.user);
                    toast({ title: t('checkout.toasts.address_saved_title'), description: t('checkout.toasts.address_saved_desc') });
                } else {
                     toast({ title: t('checkout.toasts.address_save_error_title'), description: t('checkout.toasts.address_save_error_desc'), variant: "destructive" });
                }
            }
            window.location.href = checkoutUrl;
        } else {
            throw new Error('No se recibió la URL de pago.');
        }

    } catch (error: any) {
        console.error("Payment Initiation Error: ", error);
        toast({ title: t('checkout.toasts.order_error_title'), description: error.message || t('checkout.toasts.order_error_desc'), variant: 'destructive' });
        setLoading(false);
    }
  };


  if ((isUserLoading && !user) || (cartCount === 0 && !loading)) {
    return <div className="flex flex-col items-center justify-center h-[50vh] text-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Cargando carrito...</p></div>;
  }

  const addresses: Address[] = userDoc?.addresses || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center font-bold">{t('checkout.title')}</h1>
      <Stepper currentStep={step} t={t} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinalSubmit)}>
            {step === 1 && (
                <Card>
                    <CardHeader><CardTitle>{t('checkout.confirm_cart_title')}</CardTitle></CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <ShoppingBag className="h-4 w-4"/>
                            <AlertTitle>Revisa tu pedido</AlertTitle>
                            <AlertDescription>Confirma los artículos y cantidades antes de continuar.</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('checkout.user_details_title')}</CardTitle>
                        <p className="text-muted-foreground">{user ? t('checkout.user_details_subtitle') : t('checkout.user_details_not_logged_in')}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!user ? (
                            <Alert variant="destructive">
                                <Lock className="h-4 w-4" />
                                <AlertTitle>{t('checkout.login_required_alert_title')}</AlertTitle>
                                <AlertDescription>
                                    {t('checkout.login_required_alert_desc')}
                                    <div className="mt-4 flex gap-4">
                                        <Button asChild><Link href="/login?redirect=/checkout">{t('checkout.login_button')}</Link></Button>
                                        <Button asChild variant="outline"><Link href="/register">{t('checkout.register_button')}</Link></Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ) : (
                           <>
                                {addresses.length > 0 && (
                                    <RadioGroup value={selectedAddressId} onValueChange={(id) => handleAddressSelection(id, addresses)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr, index) => (
                                            <Label key={addr.id} htmlFor={addr.id} className={cn("flex flex-col rounded-lg border p-4 cursor-pointer hover:bg-primary/10 transition-colors", selectedAddressId === addr.id && "border-primary ring-2 ring-primary")}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">{addr.alias || `${t('account.addresses_title')} ${index + 1}`}</span>
                                                    <RadioGroupItem value={addr.id} id={addr.id} />
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-2"><p>{addr.street}</p><p>{addr.postalCode} {addr.city}</p></div>
                                            </Label>
                                        ))}
                                        <Label htmlFor="new" className={cn("flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-primary/10 transition-colors", selectedAddressId === 'new' && "border-primary ring-2 ring-primary bg-primary/10")}>
                                            <UserPlus className="h-5 w-5" /><span>{t('checkout.use_new_address')}</span><RadioGroupItem value="new" id="new" className="sr-only" />
                                        </Label>
                                    </RadioGroup>
                                )}
                                <div className={cn(user && addresses.length > 0 && selectedAddressId !== 'new' && "hidden")}>
                                    <h3 className="font-bold text-lg mb-4">{t('checkout.shipping_address_title')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>{t('checkout.fullname_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel><Mail className="inline-block mr-2"/>{t('checkout.email_label')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel><Phone className="inline-block mr-2"/>{t('checkout.phone_label')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>{t('checkout.street_label')}</FormLabel><FormControl><Input placeholder={t('checkout.street_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>{t('checkout.city_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>{t('checkout.state_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>{t('checkout.zip_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>{t('checkout.country_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    {selectedAddressId === 'new' && <FormField control={form.control} name="saveAddress" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4"><FormLabel className="mb-0">{t('checkout.save_address_label')}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />}
                                </div>
                           </>
                        )}
                        {user && (
                            <>
                                <Separator />
                                <FormField control={form.control} name="useDifferentBilling" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm"><div className="space-y-0.5"><FormLabel className="text-base">{t('checkout.use_different_billing_label')}</FormLabel><p className="text-sm text-muted-foreground">{t('checkout.use_different_billing_desc')}</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                {formValues.useDifferentBilling && (<div className="space-y-4 pt-4 border-t"><h3 className="font-bold text-lg">{t('checkout.billing_address_title')}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={form.control} name="billing_name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>{t('checkout.fullname_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="billing_street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>{t('checkout.street_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="billing_city" render={({ field }) => (<FormItem><FormLabel>{t('checkout.city_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="billing_state" render={({ field }) => (<FormItem><FormLabel>{t('checkout.state_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="billing_postalCode" render={({ field }) => (<FormItem><FormLabel>{t('checkout.zip_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="billing_country" render={({ field }) => (<FormItem><FormLabel>{t('checkout.country_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div></div>)}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
            
            {step === 3 && (
                <Card>
                    <CardHeader><CardTitle>{t('checkout.review_title')}</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">{t('checkout.order_summary_title')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Input placeholder={t('checkout.coupon_placeholder')} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-grow" disabled={couponLoading || !!appliedCoupon} />
                                    <Button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim() || !!appliedCoupon}>
                                        {couponLoading ? <Loader2 className="animate-spin" /> : (appliedCoupon ? t('checkout.applied_button') : t('checkout.apply_button'))}
                                    </Button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>{t('checkout.subtotal')}</span><span>{formatPrice(finalTotals.subtotal)}</span></div>
                                    {couponDiscount > 0 && (<div className="flex justify-between text-destructive"><span>{t('checkout.coupon_discount')} ({appliedCoupon?.code})</span><span>-{formatPrice(couponDiscount)}</span></div>)}
                                    <div className="flex justify-between"><span>{t('checkout.shipping')}</span><span>{t('checkout.free_shipping')}</span></div>
                                    <Separator/>
                                    <div className="flex justify-between font-bold text-xl"><span>{t('checkout.total_payable')}</span><span className="text-primary">{formatPrice(finalTotals.total)}</span></div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div><h3 className="font-semibold mb-2">{t('checkout.products_title')}</h3>{cartItems.map((item) => (<div key={item.id} className="flex items-center gap-4 py-1"><div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border"><Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" /></div><div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p></div><p className="font-medium">{formatPrice(item.price * item.quantity)}</p></div>))}</div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><h3 className="font-semibold mb-2">{t('checkout.shipping_address_title')}</h3><div className="text-sm text-muted-foreground"><p>{formValues.name}</p><p>{formValues.phone}</p><p>{formValues.street}</p><p>{formValues.city}, {formValues.state}, {formValues.postalCode}</p><p>{formValues.country}</p></div></div>
                            <div><h3 className="font-semibold mb-2">{t('checkout.billing_address_title')}</h3>{formValues.useDifferentBilling ? (<div className="text-sm text-muted-foreground"><p>{formValues.billing_name}</p><p>{formValues.billing_street}</p><p>{formValues.billing_city}, {formValues.billing_state}, {formValues.billing_postalCode}</p><p>{formValues.billing_country}</p></div>) : (<p className="text-sm text-muted-foreground">{t('checkout.billing_address_same')}</p>)}</div>
                        </div>
                    </CardContent>
                    <CardFooter>
                       <Button size="lg" type="submit" disabled={loading} className="w-full">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t('checkout.confirming_button')}</> : <><CreditCard className="mr-2"/>{t('checkout.confirm_order_button')}</>}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrevStep}><ArrowLeft className="mr-2" /> {t('checkout.previous_button')}</Button>) : (<Button asChild type="button" variant="outline"><Link href="/products">&larr; {t('checkout.continue_shopping')}</Link></Button>)}
                {step < 3 && (<Button type="button" onClick={handleNextStep} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('checkout.processing_button')}</> : t('checkout.next_button')}</Button>)}
            </div>
        </form>
      </Form>
    </div>
  );
}
