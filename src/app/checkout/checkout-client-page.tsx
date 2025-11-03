
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, ArrowLeft, Lock, Eye, EyeOff, UserPlus, Banknote, CreditCard, Smartphone, FileText, PlusCircle, AlertCircle, UserCheck, Gift, Bitcoin, Ticket } from 'lucide-react';
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
import { QuantitySelector } from '@/components/quantity-selector';
import { serverTimestamp, collection, addDoc, doc, getDoc, writeBatch, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { ShippingAddress } from '@/lib/types';
import { useCheckout } from '@/context/checkout-context';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';
import { updateUser } from '@/app/actions/user-data';
import { createNowPaymentsInvoice } from '@/app/actions/nowpayments';
import { trackKlaviyoEvent, formatOrderForKlaviyo } from '@/app/actions/klaviyo';
import { Coupon } from '@/app/admin/coupons/page';
import { useTranslation } from '@/context/language-context';


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
    paymentMethod: z.enum(['cod_cash', 'cod_card', 'cod_bizum', 'prepaid_bizum', 'prepaid_transfer', 'crypto'], {
        required_error: t('checkout.form_errors.payment_method_required')
    }),
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

// --- Helper Functions ---
const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const SHIPPING_COST = 695; // 6,95€ en céntimos
const FREE_SHIPPING_THRESHOLD = 4000; // 40€ en céntimos

// --- Components ---
const Stepper = ({ currentStep, t }: { currentStep: number, t: (key: string) => string }) => {
    const steps = [
        { number: 1, name: t('checkout.stepper.cart') }, 
        { number: 2, name: t('checkout.stepper.details') }, 
        { number: 3, name: t('checkout.stepper.payment') }, 
        { number: 4, name: t('checkout.stepper.review') }
    ];
    return (
        <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
                 <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div className={cn("flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all", currentStep > step.number ? "bg-primary border-primary text-primary-foreground" : (currentStep === step.number ? "border-primary text-primary" : "border-muted text-muted-foreground bg-muted/50"))}>
                            {currentStep > step.number ? <UserCheck /> : step.number}
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
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart, volumeDiscount } = useCart();
  const { user, loading: isUserLoading, userDoc, setUserDoc } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [paymentCategory, setPaymentCategory] = useState<'cod' | 'prepaid' | null>('prepaid');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  
  const checkoutSchema = getCheckoutSchema(t);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
        name: '', 
        email: '', 
        phone: '', 
        street: '', 
        city: '', 
        state: '', 
        postalCode: '', 
        country: '',
        saveAddress: false,
        paymentMethod: 'crypto', // Default to crypto
        useDifferentBilling: false 
    },
  });
  
  const formValues = form.watch();

  const isCod = useMemo(() => {
      const method = form.getValues('paymentMethod');
      return method.startsWith('cod');
  }, [form.watch('paymentMethod')]);

  const subtotalAfterVolumeDiscount = useMemo(() => {
    const discount = isCod ? 0 : (volumeDiscount || 0);
    return cartTotal - discount;
  }, [cartTotal, volumeDiscount, isCod]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !user) return;
    setCouponLoading(true);
    setAppliedCoupon(null);
    setCouponDiscount(0);

    try {
        const couponRef = doc(db, 'coupons', couponCode.toUpperCase());
        const couponSnap = await getDoc(couponRef);

        if (!couponSnap.exists()) {
            throw new Error(t('checkout.toasts.coupon_error_invalid'));
        }

        const couponData = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
        const now = new Date();

        if (!couponData.isActive) throw new Error(t('checkout.toasts.coupon_error_inactive'));
        if (couponData.startDate && now < new Date(couponData.startDate)) throw new Error(t('checkout.toasts.coupon_error_not_yet_valid'));
        if (couponData.endDate && now > new Date(couponData.endDate)) throw new Error(t('checkout.toasts.coupon_error_expired'));
        if (couponData.usageLimit > 0 && couponData.usageCount >= couponData.usageLimit) throw new Error(t('checkout.toasts.coupon_error_limit_reached'));
        if (couponData.minPurchase && subtotalAfterVolumeDiscount < couponData.minPurchase) throw new Error(t('checkout.toasts.coupon_error_min_purchase', {price: formatPrice(couponData.minPurchase)}));
        
        if (couponData.onePerUser) {
            const ordersQuery = query(
                collection(db, 'users', user.uid, 'orders'),
                where('coupon.code', '==', couponData.code)
            );
            const pastOrdersSnap = await getDocs(ordersQuery);
            if (!pastOrdersSnap.empty) {
                throw new Error(t('checkout.toasts.coupon_error_already_used'));
            }
        }
        
        let discount = 0;
        if (couponData.discountType === 'fixed') {
            discount = couponData.discountValue;
        } else { // percentage
            discount = Math.round(subtotalAfterVolumeDiscount * (couponData.discountValue / 100));
        }

        setAppliedCoupon(couponData);
        setCouponDiscount(discount);
        toast({ title: t('checkout.toasts.coupon_applied_title'), description: t('checkout.toasts.coupon_applied_desc', { discount: formatPrice(discount) }) });

    } catch (error: any) {
        toast({ title: t('checkout.toasts.coupon_error_title'), description: error.message, variant: 'destructive' });
    } finally {
        setCouponLoading(false);
    }
  }, [couponCode, subtotalAfterVolumeDiscount, toast, user, t]);


  const finalTotals = useMemo(() => {
    const subtotal = cartTotal;
    const discount = isCod ? 0 : (volumeDiscount || 0);
    const subtotalWithDiscounts = subtotal - discount - couponDiscount;
    
    let shipping = 0;
    if (!isCod) {
        shipping = 0;
    } else if (subtotalWithDiscounts > 0 && subtotalWithDiscounts < FREE_SHIPPING_THRESHOLD) {
        shipping = SHIPPING_COST;
    }
    
    const total = subtotalWithDiscounts + shipping;

    return { subtotal, discount, shipping, total };
  }, [cartTotal, volumeDiscount, isCod, couponDiscount]);


    useEffect(() => {
        if (!isUserLoading && cartCount === 0 && !loading) {
        router.push('/');
        }
    }, [cartCount, router, loading, isUserLoading]);
    
    useEffect(() => {
        if (user && userDoc) {
            const userAddresses: Address[] = userDoc.addresses || [];
            const defaultAddress = userAddresses.find(addr => addr.isDefault);
            
            if (defaultAddress) {
                handleAddressSelection(defaultAddress.id, userAddresses);
            } else if (userAddresses.length > 0) {
                 handleAddressSelection(userAddresses[0].id, userAddresses);
            } else {
                 form.setValue('email', user.email || '');
            }
        } else if (user) {
            form.setValue('email', user.email || '');
        }
    }, [user, userDoc]);
    
    const handleAddressSelection = (addressId: string, currentAddresses: Address[] = userDoc?.addresses || []) => {
        setSelectedAddressId(addressId);
        const email = user?.email || '';
        
        if (addressId === 'new') {
            form.reset({ 
                ...form.getValues(),
                email: email,
                name: user?.displayName || user?.email?.split('@')[0] || '',
                phone: '',
                street: '', 
                city: '', 
                state: '', 
                postalCode: '', 
                country: '',
                saveAddress: false,
            });
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


  const handleNextStep = async () => {
    let isValid = false;
    if (step === 1) {
        isValid = true;
    } else if (step === 2) {
      if (!user) {
         toast({
            title: t('checkout.toasts.login_required_title'),
            description: t('checkout.toasts.login_required_desc'),
            variant: "destructive",
         });
         router.push('/login?redirect=/checkout');
         return;
      }
      if (selectedAddressId !== 'new') {
          isValid = true;
      } else {
        const fieldsToValidate: (keyof CheckoutFormValues)[] = ['name', 'email', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
        if (form.getValues('useDifferentBilling')) {
          fieldsToValidate.push('billing_name', 'billing_street', 'billing_city', 'billing_state', 'billing_postalCode', 'billing_country');
        }
        isValid = await form.trigger(fieldsToValidate);
      }
    } else if (step === 3) {
      isValid = await form.trigger(['paymentMethod']);
    } else {
      isValid = true;
    }
    
    if (isValid) {
        setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => { setStep(prev => prev - 1); };
  
  const onFinalSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast({ title: t('auth.login_title'), description: t('checkout.toasts.login_required_desc'), variant: 'destructive' });
      setStep(2);
      return;
    }
    setLoading(true);

    if (data.saveAddress && selectedAddressId === 'new') {
        const addressToSave = {
            alias: `${t('account.addresses_title')} ${userDoc?.addresses?.length + 1 || 1}`,
            name: data.name,
            phone: data.phone,
            street: data.street,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
        };
        const result = await updateUser('add-address', addressToSave);
        if (result.success && result.user) {
            setUserDoc(result.user);
            toast({ title: t('checkout.toasts.address_saved_title'), description: t('checkout.toasts.address_saved_desc') });
        } else {
             toast({ title: t('checkout.toasts.address_save_error_title'), description: t('checkout.toasts.address_save_error_desc'), variant: "destructive" });
        }
    }


    if (data.paymentMethod === 'crypto') {
        try {
            const result = await createNowPaymentsInvoice({
                price_amount: finalTotals.total / 100, // Convert cents to euros/dollars
                price_currency: 'eur',
                order_id: `order_${user.uid}_${Date.now()}`,
                order_description: `Pedido de ${cartCount} productos en PuroRush`
            });

            if (result.success && result.invoice_url) {
                window.location.href = result.invoice_url;
            } else {
                throw new Error(result.error || t('checkout.toasts.crypto_error_desc'));
            }
        } catch (error: any) {
            toast({ title: t('checkout.toasts.crypto_error_title'), description: error.message, variant: 'destructive' });
            setLoading(false);
        }
        return; 
    }


    try {
        const shippingAddress: ShippingAddress = { line1: data.street, line2: null, city: data.city, state: data.state, postal_code: data.postalCode, country: data.country, phone: data.phone };

        const itemsForPayload = cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl.includes('/api/image-proxy?url=')
                ? decodeURIComponent(item.imageUrl.split('url=')[1] || '')
                : item.imageUrl,
        }));
        
        const orderData = {
            userId: user.uid,
            status: 'Reserva Recibida' as const,
            total: finalTotals.total,
            items: itemsForPayload,
            customerName: data.name,
            customerEmail: data.email,
            shippingAddress: shippingAddress,
            paymentMethod: data.paymentMethod,
            createdAt: serverTimestamp(),
            ...(data.useDifferentBilling && {
                billingDetails: {
                    name: data.billing_name,
                    street: data.billing_street,
                    city: data.billing_city,
                    state: data.billing_state,
                    postalCode: data.billing_postalCode,
                    country: data.billing_country
                }
            }),
            ...(appliedCoupon && {
                coupon: {
                    code: appliedCoupon.code,
                    discount: couponDiscount,
                }
            })
        };

        const batch = writeBatch(db);
        const orderCollectionRef = collection(db, 'users', user.uid, 'orders');
        const newOrderRef = doc(orderCollectionRef); // Create a new doc reference
        batch.set(newOrderRef, orderData);

        // Increment coupon usage count if a coupon was applied
        if (appliedCoupon) {
            const couponRef = doc(db, 'coupons', appliedCoupon.id);
            batch.update(couponRef, {
                usageCount: (appliedCoupon.usageCount || 0) + 1,
            });
        }
        
        await batch.commit();
        
        const pointsToAdd = Math.floor(finalTotals.total / 1000);
        if (pointsToAdd > 0) {
            const result = await updateUser('update-points', { pointsToAdd });
            if (result.success && result.user) {
                setUserDoc(result.user);
                 toast({
                    title: t('checkout.toasts.points_earned_title'),
                    description: t('checkout.toasts.points_earned_desc', { points: pointsToAdd }),
                });
            }
        }

        const klaviyoOrderData = await formatOrderForKlaviyo({ ...orderData, id: newOrderRef.id, createdAt: new Date() }, newOrderRef.id);
        
        await trackKlaviyoEvent('Placed Order', data.email, klaviyoOrderData);
        // await trackKlaviyoEvent('Admin New Order Notification', 'maryandpopper@gmail.com', {
        //     'OrderId': newOrderRef.id,
        //     'CustomerName': data.name,
        //     'Total': finalTotals.total / 100,
        //     'ItemCount': itemsForPayload.length
        // });

        toast({
            duration: 10000,
            title: t('checkout.toasts.order_success_title'),
            description: t('checkout.toasts.order_success_desc', {orderId: newOrderRef.id.substring(newOrderRef.id.length - 7)}),
            action: (
                <div className="flex flex-col gap-2">
                    <ToastAction asChild altText={t('checkout.toasts.view_order_button')}>
                        <Link href={`/account/orders/${newOrderRef.id}`}>{t('checkout.toasts.view_order_button')}</Link>
                    </ToastAction>
                    <ToastAction asChild altText={t('checkout.toasts.continue_shopping_button')}>
                        <Link href="/">{t('checkout.toasts.continue_shopping_button')}</Link>
                    </ToastAction>
                </div>
            ),
        });

        clearCart();
        router.push('/');

    } catch (error: any) {
        console.error("Order Creation Error: ", error);
        toast({ title: t('checkout.toasts.order_error_title'), description: error.message || t('checkout.toasts.order_error_desc'), variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  const paymentMethods = {
      cod: [
          { value: 'cod_cash', label: t('checkout.payment_options.cod_cash'), icon: Banknote },
          { value: 'cod_card', label: t('checkout.payment_options.cod_card'), icon: CreditCard },
          { value: 'cod_bizum', label: t('checkout.payment_options.cod_bizum'), icon: Smartphone }
      ],
      prepaid: [
          { value: 'crypto', label: t('checkout.payment_options.crypto'), icon: Bitcoin },
          { value: 'prepaid_bizum', label: t('checkout.payment_options.prepaid_bizum'), icon: Smartphone },
          { value: 'prepaid_transfer', label: t('checkout.payment_options.prepaid_transfer'), icon: Banknote },
      ]
  };

  if ((isUserLoading && !user) || (cartCount === 0 && !loading)) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Cargando carrito...</p>
        </div>
    );
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
                    <CardContent className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border"><Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" /></div>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                                    <div className="mt-2"><QuantitySelector quantity={item.quantity} onQuantityChange={(q) => updateQuantity(item.id, q)} maxStock={item.stock} /></div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>Eliminar</Button>
                                </div>
                            </div>
                        ))}
                         <Separator />
                         <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>{t('cart.subtotal')}</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                             {volumeDiscount > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>{t('cart.volume_discount')}</span>
                                    <span>-{formatPrice(volumeDiscount)}</span>
                                </div>
                            )}
                             <div className="flex justify-between font-bold text-lg">
                                <span>{t('cart.total_estimate')}</span>
                                <span>{formatPrice(subtotalAfterVolumeDiscount)}</span>
                            </div>
                        </div>
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
                                <AlertCircle className="h-4 w-4" />
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
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    <p>{addr.street}</p>
                                                    <p>{addr.postalCode} {addr.city}</p>
                                                </div>
                                            </Label>
                                        ))}
                                        <Label htmlFor="new" className={cn("flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-primary/10 transition-colors", selectedAddressId === 'new' && "border-primary ring-2 ring-primary bg-primary/10")}>
                                            <PlusCircle className="h-5 w-5" />
                                            <span>{t('checkout.use_new_address')}</span>
                                            <RadioGroupItem value="new" id="new" className="sr-only" />
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
                                    {selectedAddressId === 'new' && (
                                        <FormField control={form.control} name="saveAddress" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                                                <FormLabel className="mb-0">{t('checkout.save_address_label')}</FormLabel>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    )}
                                </div>
                           </>
                        )}
                        {user && (
                            <>
                                <Separator />
                                <FormField control={form.control} name="useDifferentBilling" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">{t('checkout.use_different_billing_label')}</FormLabel>
                                            <p className="text-sm text-muted-foreground">{t('checkout.use_different_billing_desc')}</p>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )} />
        
                                {formValues.useDifferentBilling && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-bold text-lg">{t('checkout.billing_address_title')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="billing_name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>{t('checkout.fullname_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>{t('checkout.street_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_city" render={({ field }) => (<FormItem><FormLabel>{t('checkout.city_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_state" render={({ field }) => (<FormItem><FormLabel>{t('checkout.state_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_postalCode" render={({ field }) => (<FormItem><FormLabel>{t('checkout.zip_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_country" render={({ field }) => (<FormItem><FormLabel>{t('checkout.country_label')} ({t('checkout.billing_address_title')})</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader><CardTitle>{t('checkout.payment_method_title')}</CardTitle></CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <RadioGroup
                                        value={paymentCategory ?? ''}
                                        onValueChange={(value: 'cod' | 'prepaid') => {
                                            setPaymentCategory(value);
                                            const defaultSubOption = paymentMethods[value][0].value;
                                            field.onChange(defaultSubOption);
                                        }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <Label htmlFor="cat-cod" className={cn("flex flex-col items-center justify-center rounded-lg border p-4 cursor-pointer transition-colors hover:bg-primary/10", paymentCategory === 'cod' && "border-primary ring-2 ring-primary")}>
                                            <RadioGroupItem value="cod" id="cat-cod" className="sr-only" />
                                            <CreditCard className="mb-2 h-8 w-8" />
                                            <span className="font-bold">{t('checkout.cod_label')}</span>
                                            <span className="text-xs text-muted-foreground">{t('checkout.cod_desc')}</span>
                                        </Label>
                                        <Label htmlFor="cat-prepaid" className={cn("flex flex-col items-center justify-center rounded-lg border p-4 cursor-pointer transition-colors hover:bg-primary/10", paymentCategory === 'prepaid' && "border-primary ring-2 ring-primary")}>
                                            <RadioGroupItem value="prepaid" id="cat-prepaid" className="sr-only" />
                                            <Banknote className="mb-2 h-8 w-8" />
                                            <span className="font-bold">{t('checkout.prepaid_label')}</span>
                                            <span className="text-xs text-primary">{t('checkout.prepaid_desc')}</span>
                                        </Label>
                                    </RadioGroup>

                                    {paymentCategory && (
                                        <div className="pt-4 mt-4 border-t">
                                            {paymentCategory === 'prepaid' && (
                                                <Alert variant="default" className="mb-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                                                    <Gift className="h-4 w-4 !text-green-600" />
                                                    <AlertTitle className="text-green-800 dark:text-green-300">{t('checkout.launch_promo_title')}</AlertTitle>
                                                    <AlertDescription className="text-green-700 dark:text-green-400" dangerouslySetInnerHTML={{ __html: t('checkout.launch_promo_desc') }} />
                                                </Alert>
                                            )}
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                {paymentMethods[paymentCategory].map(method => (
                                                    <FormItem key={method.value} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-primary/10 transition-colors">
                                                        <FormControl>
                                                            <RadioGroupItem value={method.value} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal w-full flex items-center gap-3 cursor-pointer">
                                                            <method.icon />
                                                            {method.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            )}
            
            {step === 4 && (
                <Card>
                    <CardHeader><CardTitle>{t('checkout.review_title')}</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">{t('checkout.order_summary_title')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        placeholder={t('checkout.coupon_placeholder')}
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-grow"
                                        disabled={couponLoading || !!appliedCoupon}
                                    />
                                    <Button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim() || !!appliedCoupon}>
                                        {couponLoading ? <Loader2 className="animate-spin" /> : (appliedCoupon ? t('checkout.applied_button') : t('checkout.apply_button'))}
                                    </Button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>{t('checkout.subtotal')}</span>
                                        <span>{formatPrice(finalTotals.subtotal)}</span>
                                    </div>
                                    {finalTotals.discount > 0 && (
                                        <div className="flex justify-between text-destructive">
                                            <span>{t('checkout.volume_discount')}</span>
                                            <span>-{formatPrice(finalTotals.discount)}</span>
                                        </div>
                                    )}
                                     {couponDiscount > 0 && (
                                        <div className="flex justify-between text-destructive">
                                            <span>{t('checkout.coupon_discount')} ({appliedCoupon?.code})</span>
                                            <span>-{formatPrice(couponDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>{t('checkout.shipping')}</span>
                                        <span>{finalTotals.shipping > 0 ? formatPrice(finalTotals.shipping) : t('checkout.free_shipping')}</span>
                                    </div>
                                    <Separator/>
                                    <div className="flex justify-between font-bold text-xl">
                                        <span>{t('checkout.total_payable')}</span>
                                        <span className="text-primary">{formatPrice(finalTotals.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div><h3 className="font-semibold mb-2">{t('checkout.products_title')}</h3>{cartItems.map((item) => (<div key={item.id} className="flex items-center gap-4 py-1"><div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border"><Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" /></div><div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p></div><p className="font-medium">{formatPrice(item.price * item.quantity)}</p></div>))}</div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><h3 className="font-semibold mb-2">{t('checkout.shipping_address_title')}</h3><div className="text-sm text-muted-foreground"><p>{formValues.name}</p><p>{formValues.phone}</p><p>{formValues.street}</p><p>{formValues.city}, {formValues.state}, {formValues.postalCode}</p><p>{formValues.country}</p></div></div>
                            <div>
                                <h3 className="font-semibold mb-2">{t('checkout.billing_address_title')}</h3>
                                {formValues.useDifferentBilling ? (
                                    <div className="text-sm text-muted-foreground">
                                        <p>{formValues.billing_name}</p>
                                        <p>{formValues.billing_street}</p>
                                        <p>{formValues.billing_city}, {formValues.billing_state}, {formValues.billing_postalCode}</p>
                                        <p>{formValues.billing_country}</p>
                                    </div>
                                ) : (<p className="text-sm text-muted-foreground">{t('checkout.billing_address_same')}</p>)}
                            </div>
                        </div>
                         <div><h3 className="font-semibold mb-2">{t('checkout.payment_method')}</h3><div className="text-sm text-muted-foreground"><p>{paymentMethods[form.getValues('paymentMethod').startsWith('cod') ? 'cod' : 'prepaid'].find(m => m.value === formValues.paymentMethod)?.label}</p></div></div>
                        <Separator />
                         <p className="text-xs text-muted-foreground text-center">{formValues.paymentMethod?.startsWith('prepaid') ? t('checkout.payment_instructions_prepaid') : t('checkout.payment_instructions_cod')} {t('checkout.payment_instructions_email')}</p>
                    </CardContent>
                </Card>
            )}

            <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrevStep}><ArrowLeft className="mr-2" /> {t('checkout.previous_button')}</Button>) : (<Button asChild type="button" variant="outline"><Link href="/products">&larr; {t('checkout.continue_shopping')}</Link></Button>)}
                
                {step < 4 && (<Button type="button" onClick={handleNextStep} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('checkout.processing_button')}</> : t('checkout.next_button')}</Button>)}
                
                {step === 4 && (
                    <Button size="lg" type="submit" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t('checkout.confirming_button')}</> : t('checkout.confirm_order_button')}
                    </Button>
                )}
            </div>
        </form>
      </Form>
    </div>
  );
}
