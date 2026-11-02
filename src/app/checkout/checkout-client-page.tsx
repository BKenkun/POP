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
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Lock,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  LogIn,
  UserPlus,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  LogOut,
  Mail,
  User,
  Info,
  Truck,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Coupon } from '@/app/admin/coupons/page';
import { useTranslation } from '@/context/language-context';
import { QuantitySelector } from '@/components/quantity-selector';
import { createHilowApiOrder } from '@/app/actions/hilow';
import { createNowPaymentsInvoice } from '@/app/actions/nowpayments';
import { getPacklinkShippingQuotes, type PacklinkQuote } from '@/app/actions/packlink';
import { createCheckoutOrder, type CheckoutOrderData } from '@/app/actions/checkout';
import Link from 'next/link';

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
    name: z.string().min(3, t('checkout.form_errors.name_required') || 'Full name is required.'),
    email: z.string().email(t('checkout.form_errors.email_invalid') || 'Please enter a valid email address.'),
    phone: z.string().min(9, t('checkout.form_errors.phone_required') || 'Phone number must have at least 9 digits.'),
    street: z.string().min(5, t('checkout.form_errors.street_required') || 'Street and house number are required.'),
    city: z.string().min(2, t('checkout.form_errors.city_required') || 'City is required.'),
    state: z.string().min(2, t('checkout.form_errors.state_required') || 'State / province is required.'),
    postalCode: z.string().min(3, t('checkout.form_errors.zip_required') || 'Postal code is required.'),
    country: z.string().min(2, t('checkout.form_errors.country_required') || 'Country is required.'),
    saveAddress: z.boolean().default(false),
  });

type CheckoutFormValues = z.infer<ReturnType<typeof getCheckoutSchema>>;

function checkoutFieldLabels(t: (key: string) => string): Record<keyof CheckoutFormValues, string> {
  return {
    name: t('checkout.fullname_label') || 'Full Name',
    email: t('checkout.email_label') || 'Email Address',
    phone: t('checkout.phone_label') || 'Phone Number',
    street: t('checkout.street_label') || 'Street Address',
    city: t('checkout.city_label') || 'City',
    state: t('checkout.state_label') || 'State / Province',
    postalCode: t('checkout.zip_label') || 'Postal Code',
    country: t('checkout.country_label') || 'Country',
    saveAddress: t('checkout.save_address_label') || 'Save this address',
  };
}

function zodIssuesToLines(
  issues: z.ZodIssue[],
  t: (key: string) => string
): string[] {
  const labels = checkoutFieldLabels(t);
  return issues.map((issue) => {
    const path = issue.path[0] as keyof CheckoutFormValues | undefined;
    const label = path && path in labels ? labels[path] : String(path ?? 'field');
    return `${label}: ${issue.message}`;
  });
}

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('firebasestorage.googleapis.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

const Stepper = ({ currentStep, t }: { currentStep: number; t: (key: string) => string; }) => {
  const steps = [
    { number: 1, name: t('checkout.stepper.cart') },
    { number: 2, name: t('checkout.stepper.details') },
    { number: 3, name: t('checkout.stepper.review') },
  ];
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div className={cn('flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all', currentStep >= step.number ? 'bg-primary border-primary text-primary-foreground font-bold' : 'border-muted text-muted-foreground bg-muted/50')}>
              {step.number}
            </div>
            <p className={cn('mt-2 text-sm font-medium', currentStep >= step.number ? 'text-primary font-semibold' : 'text-muted-foreground')}>
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
  const { cartItems, cartTotal, cartCount, updateQuantity, volumeDiscount } = useCart();
  const { user, loading: isUserLoading, userDoc } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [packlinkQuote, setPacklinkQuote] = useState<PacklinkQuote | null>(null);
  const [packlinkLoading, setPacklinkLoading] = useState(false);
  const FREE_SHIPPING_THRESHOLD = 4000; // 40 EUR; precios internos en céntimos
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentErrorKind, setPaymentErrorKind] = useState<'hilow' | 'nowpayments' | 'local' | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'hilow' | 'nowpayments'>('hilow');

  /** Opciones de la pantalla 2 (cuando no está logueado) */
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login' | 'register'>('guest');

  // Estados para el login integrado
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados para el registro integrado
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  /** Errores mostrados junto al botón de pago (paso 3) */
  const [payStepDetail, setPayStepDetail] = useState<{
    title: string;
    items: string[];
    hint?: string;
  } | null>(null);
  /** Errores al pulsar Continuar en el paso 2 */
  const [step2ValidationLines, setStep2ValidationLines] = useState<string[] | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(getCheckoutSchema(t)),
    defaultValues: { name: '', email: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'España', saveAddress: false },
    shouldUnregister: false,
  });

  const finalTotals = useMemo(() => {
    const subtotal = cartTotal;
    const subtotalWithDiscounts = Math.max(0, subtotal - volumeDiscount - couponDiscount);
    const isFreeShipping = subtotalWithDiscounts >= FREE_SHIPPING_THRESHOLD || appliedCoupon?.discountType === 'free_shipping';
    const shippingCost = isFreeShipping ? 0 : Math.round((packlinkQuote?.price || 0) * 100);
    const total = subtotalWithDiscounts + shippingCost;
    return {
      subtotal,
      subtotalWithDiscounts,
      shippingCost,
      total,
      priceInCents: Math.round(total),
      isFreeShipping,
    };
  }, [cartTotal, volumeDiscount, couponDiscount, packlinkQuote, appliedCoupon]);

  useEffect(() => {
    if (user && userDoc) {
      const userAddresses: Address[] = userDoc.addresses || [];
      const defaultAddress = userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
      if (defaultAddress) {
        form.setValue('name', defaultAddress.name);
        form.setValue('phone', defaultAddress.phone);
        form.setValue('street', defaultAddress.street);
        form.setValue('city', defaultAddress.city);
        form.setValue('state', defaultAddress.state || defaultAddress.city);
        form.setValue('postalCode', defaultAddress.postalCode);
        form.setValue('country', defaultAddress.country || 'España');
      } else if (user.displayName) {
        form.setValue('name', user.displayName);
      }
      form.setValue('email', user.email || '');
    } else if (user) {
      form.setValue('email', user.email || '');
      if (user.displayName) {
        form.setValue('name', user.displayName);
      }
    }
  }, [user, userDoc, form]);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', code));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error(t('checkout.toasts.coupon_error_invalid') || 'Invalid coupon or not found.');
      }
      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
      if (!coupon.isActive) {
        throw new Error(t('checkout.toasts.coupon_error_inactive') || 'This coupon is not currently active.');
      }

      // Validate validity dates
      if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
        throw new Error('This coupon is not available yet.');
      }
      if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
        throw new Error('This coupon has expired.');
      }

      // Validate usage limits
      if (coupon.usageLimit && coupon.usageLimit > 0 && (coupon.usageCount || 0) >= coupon.usageLimit) {
        throw new Error(
          coupon.usageLimit === 1
            ? 'This single-use coupon has already been redeemed.'
            : `This coupon has reached the maximum limit of ${coupon.usageLimit} uses.`
        );
      }

      // Validate minimum purchase
      if (coupon.minPurchase && coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
        throw new Error(`This coupon requires a minimum purchase of ${formatPrice(coupon.minPurchase)}.`);
      }

      // Validate 1 per user
      if (coupon.onePerUser) {
        if (!user) {
          throw new Error('This exclusive coupon (1 use per customer) requires you to log in or create an account.');
        }
        const userOrdersSnap = await getDocs(
          query(
            collection(db, 'users', user.uid, 'orders'),
            where('coupon.code', '==', coupon.code)
          )
        );
        if (!userOrdersSnap.empty) {
          throw new Error('You have already used this coupon on a previous order. Only 1 use per customer is allowed.');
        }
      }

      if (coupon.discountType === 'free_shipping') {
        setAppliedCoupon(coupon);
        setCouponDiscount(0);
        toast({
          title: 'Free Shipping Applied!',
          description: `Coupon ${coupon.code} grants 100% free delivery.`,
        });
      } else {
        const discount = coupon.discountType === 'percentage'
          ? (cartTotal * coupon.discountValue) / 100
          : coupon.discountValue;
        setAppliedCoupon(coupon);
        setCouponDiscount(Math.round(discount));
        toast({
          title: t('checkout.toasts.coupon_applied_title') || 'Coupon Applied',
          description: t('checkout.toasts.coupon_applied_desc', { discount: formatPrice(discount) }) || `Discount of ${formatPrice(discount)}`,
        });
      }
    } catch (e: any) {
      toast({
        title: t('checkout.toasts.coupon_error_title') || 'Coupon Error',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, user, cartTotal, t, toast]);

  const goToStep = (next: number) => {
    setPaymentError(null);
    setPaymentErrorKind(null);
    setPayStepDetail(null);
    setStep2ValidationLines(null);
    setStep(next);
  };

  /** Handles quick inline login in step 2 */
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your email and password.');
      return;
    }
    setLoginLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const idToken = await cred.user.getIdToken();
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      form.setValue('email', cred.user.email || loginEmail.trim());
      if (cred.user.displayName) {
        form.setValue('name', cred.user.displayName);
      }
      toast({
        title: 'Logged In Successfully!',
        description: 'Your details have been loaded. You can verify your address and continue.',
      });
      setLoginLoading(false);
    } catch (err: any) {
      console.error('Error logging in inline:', err);
      let msg = 'Incorrect email or password.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. You can create one by selecting "Create an account".';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Incorrect password.';
      }
      setLoginError(msg);
      setLoginLoading(false);
    }
  };

  /** Calculates Packlink shipping rates */
  const calculateShippingRate = async (values: CheckoutFormValues): Promise<boolean> => {
    const subtotalAfterDiscounts = cartTotal - volumeDiscount - couponDiscount;
    setPacklinkLoading(true);
    try {
      const countryNames: Record<string, string> = {
        SPAIN: 'ES', ESPAÑA: 'ES', PORTUGAL: 'PT', FRANCE: 'FR', FRANCIA: 'FR',
        GERMANY: 'DE', ALEMANIA: 'DE', ITALY: 'IT', ITALIA: 'IT', BELGIUM: 'BE',
        BELGICA: 'BE', NETHERLANDS: 'NL', HOLANDA: 'NL', IRELAND: 'IE', IRLANDA: 'IE',
        'UNITED KINGDOM': 'GB', 'REINO UNIDO': 'GB',
      };
      const countryText = String(values.country || '').trim().toUpperCase();
      const countryCode = countryText.length === 2 ? countryText : countryNames[countryText];
      if (!countryCode) throw new Error('Please enter the delivery country name or its 2-letter ISO code (e.g. Spain, ES, UK).');
      
      const result = await getPacklinkShippingQuotes({ postalCode: values.postalCode, country: countryCode });
      if (!result.success || !result.quotes?.length) {
        throw new Error(result.message || 'Packlink returned no shipping rates for this postal code.');
      }
      const validQuotes = result.quotes.filter((quote) => Number.isFinite(quote.price) && quote.price >= 0);
      const isFreeShipping = subtotalAfterDiscounts >= FREE_SHIPPING_THRESHOLD || appliedCoupon?.discountType === 'free_shipping';
      const payableQuotes = !isFreeShipping
        ? validQuotes.filter((quote) => quote.price > 0)
        : validQuotes;
      if (!payableQuotes.length) {
        throw new Error('Could not obtain a Packlink shipping rate for this destination.');
      }
      setPacklinkQuote(payableQuotes[0]);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not calculate shipping cost.';
      setStep2ValidationLines([message]);
      toast({ title: 'Could Not Calculate Shipping', description: message, variant: 'destructive' });
      return false;
    } finally {
      setPacklinkLoading(false);
    }
  };

  /** Envío final al confirmar en paso 3 */
  const onFinalSubmit = async (data: CheckoutFormValues) => {
    if (finalTotals.total <= 0 || cartCount === 0) {
      setPayStepDetail({
        title: t('checkout.pay_error_panel_title'),
        items: [t('cart.empty_title'), t('cart.empty_subtitle')],
      });
      toast({
        title: t('checkout.toasts.validation_error_title'),
        description: t('cart.empty_subtitle'),
        variant: 'destructive',
      });
      return;
    }
    if (!finalTotals.isFreeShipping && (!packlinkQuote || !Number.isFinite(packlinkQuote.price) || packlinkQuote.price <= 0)) {
      setPayStepDetail({ title: 'Shipping rate required', items: ['Please return to delivery details and calculate a Packlink PRO shipping rate before proceeding to payment.'] });
      return;
    }

    setLoading(true);
    setPaymentError(null);
    setPaymentErrorKind(null);
    setPayStepDetail(null);

    const isGuestOrder = !user;
    const userId = user ? user.uid : 'guest';
    const uniqueId = `CPO_${userId}_${Date.now()}`;

    try {
      const orderPayload: CheckoutOrderData = {
        orderId: uniqueId,
        userId,
        isGuest: isGuestOrder,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        total: finalTotals.total,
        shippingCost: finalTotals.shippingCost,
        shippingFree: finalTotals.isFreeShipping,
        ...(packlinkQuote ? {
          packlink: {
            serviceId: packlinkQuote.serviceId,
            serviceName: packlinkQuote.serviceName,
            carrierName: packlinkQuote.carrierName,
            quotedPrice: packlinkQuote.price,
            currency: packlinkQuote.currency,
            status: 'quoted',
          }
        } : {}),
        customerName: data.name,
        customerEmail: data.email,
        shippingAddress: {
          line1: data.street,
          line2: null,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
        status: 'pending_payment',
        paymentMethod: selectedPaymentMethod,
        ...(appliedCoupon && {
          coupon: {
            code: appliedCoupon.code,
            discount: couponDiscount,
            discountType: appliedCoupon.discountType,
          },
        }),
      };

      const result = await createCheckoutOrder(orderPayload);
      if (!result.success) {
        throw new Error(result.error || 'Could not save the order.');
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      setPaymentErrorKind('local');
      setPaymentError(msg);
      setPayStepDetail(null);
      toast({
        title: t('checkout.payment_error_local_order_title'),
        description: msg,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (selectedPaymentMethod === 'nowpayments') {
        const result = await createNowPaymentsInvoice(uniqueId);
        if (!result.success || !result.invoiceUrl) {
          throw new Error(result.message || 'Could not initiate payment with NOWPayments.');
        }
        window.location.href = result.invoiceUrl;
        return;
      }

      const hilowResult = await createHilowApiOrder(
        uniqueId,
        finalTotals.priceInCents,
        cartItems.map((item) => `${item.quantity}x ${item.name}`).join(', '),
        false,
        window.location.origin
      );

      if (!hilowResult.success || !hilowResult.checkoutUrl) {
        throw new Error(hilowResult.message || 'Could not initiate credit/debit card payment.');
      }
      window.location.href = hilowResult.checkoutUrl;
    } catch (e: any) {
      const msg = e?.message || String(e);
      setPaymentErrorKind(selectedPaymentMethod);
      setPaymentError(msg);
      setPayStepDetail(null);
      toast({ title: t('checkout.toasts.order_error_title'), description: msg, variant: 'destructive' });
      setLoading(false);
    }
  };

  const submitCheckout = () => {
    void (async () => {
      try {
        const values = form.getValues();
        const parsed = getCheckoutSchema(t).safeParse(values);
        if (!parsed.success) {
          const lines = zodIssuesToLines(parsed.error.issues, t);
          setPaymentError(null);
          setPaymentErrorKind(null);
          setPayStepDetail({
            title: t('checkout.pay_error_validation_title'),
            items: lines.length > 0 ? lines : [t('checkout.toasts.validation_error_desc')],
            hint: t('checkout.pay_error_validation_hint'),
          });
          toast({
            title: t('checkout.toasts.validation_error_title'),
            description: lines[0] ?? t('checkout.toasts.validation_error_desc'),
            variant: 'destructive',
          });
          return;
        }
        await onFinalSubmit(parsed.data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setLoading(false);
        setPaymentErrorKind('hilow');
        setPaymentError(msg);
        setPayStepDetail({
          title: t('checkout.pay_error_panel_title'),
          items: [`${t('checkout.pay_error_technical_prefix')} ${msg}`],
        });
        toast({
          title: t('checkout.toasts.order_error_title'),
          description: msg,
          variant: 'destructive',
        });
      }
    })();
  };

  const handleContinueFromStep1 = () => {
    if (cartCount === 0) {
      toast({
        title: t('cart.empty_title'),
        description: t('cart.empty_subtitle'),
        variant: 'destructive',
      });
      return;
    }
    goToStep(2);
  };

  /** Validate and advance from step 2 */
  const handleContinueFromStep2 = async () => {
    setStep2ValidationLines(null);
    setRegisterError(null);

    // If user chose login mode but isn't logged in yet:
    if (!user && checkoutMode === 'login') {
      toast({
        title: 'Please Log In First',
        description: 'Enter your email and password and click "Log In", or choose another option.',
        variant: 'destructive',
      });
      return;
    }

    // Validate shipping details form
    const ok = await form.trigger();
    if (!ok) {
      const parsed = getCheckoutSchema(t).safeParse(form.getValues());
      const lines = parsed.success
        ? [t('checkout.toasts.validation_error_desc')]
        : zodIssuesToLines(parsed.error.issues, t);
      setStep2ValidationLines(lines);
      toast({
        title: t('checkout.toasts.validation_error_title'),
        description: lines[0] ?? t('checkout.toasts.validation_error_desc'),
        variant: 'destructive',
      });
      return;
    }

    const values = form.getValues();

    // If user chose "Create account", create it now before continuing
    if (!user && checkoutMode === 'register') {
      if (!registerPassword || registerPassword.length < 6) {
        setRegisterError('Password must be at least 6 characters.');
        toast({
          title: 'Password Required',
          description: 'Create a password of at least 6 characters for your new account.',
          variant: 'destructive',
        });
        return;
      }

      setRegisterLoading(true);
      try {
        const userCred = await createUserWithEmailAndPassword(auth, values.email.trim(), registerPassword);
        const newUser = userCred.user;
        const idToken = await newUser.getIdToken();

        // Create user document in Firestore
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          displayName: values.name,
          createdAt: serverTimestamp(),
          loyaltyPoints: 0,
          addresses: [
            {
              id: `addr_${Date.now()}`,
              alias: 'Primary',
              name: values.name,
              phone: values.phone,
              street: values.street,
              city: values.city,
              state: values.state,
              postalCode: values.postalCode,
              country: values.country,
              isDefault: true,
            },
          ],
        });

        // Create session cookie
        await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        toast({
          title: 'Account Created Successfully!',
          description: 'Your details have been saved. You will earn loyalty points with this order!',
        });
      } catch (err: any) {
        console.error('Error creating user at checkout:', err);
        let errorMsg = 'Could not create account.';
        if (err.code === 'auth/email-already-in-use') {
          errorMsg = 'An account already exists with this email. Please select "Log in".';
        } else if (err.code === 'auth/weak-password') {
          errorMsg = 'Password is too weak (minimum 6 characters).';
        }
        setRegisterError(errorMsg);
        toast({
          title: 'Error Creating Account',
          description: errorMsg,
          variant: 'destructive',
        });
        setRegisterLoading(false);
        return;
      } finally {
        setRegisterLoading(false);
      }
    }

    // Calculate Packlink shipping rate and move to step 3
    const calculated = await calculateShippingRate(values);
    if (calculated) {
      goToStep(3);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await fetch('/api/logout', { method: 'POST' });
      form.setValue('name', '');
      form.setValue('email', '');
      setCheckoutMode('guest');
      toast({
        title: 'Signed Out',
        description: 'You can now checkout as a guest or sign in with another account.',
      });
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (isUserLoading && !user) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-headline text-primary mb-8 text-center font-bold">{t('checkout.title')}</h1>
      <Stepper currentStep={step} t={t} />

      {paymentError && step !== 3 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {paymentErrorKind === 'local'
              ? t('checkout.payment_error_local_order_title')
              : t('checkout.payment_error_banner_title')}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p className="font-medium break-words">{paymentError}</p>
            <p className="text-sm opacity-90">
              {paymentErrorKind === 'local'
                ? t('checkout.payment_error_local_order_hint')
                : t('checkout.payment_error_banner_hint')}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-destructive-foreground/30 text-destructive-foreground"
              onClick={() => {
                setPaymentError(null);
                setPaymentErrorKind(null);
              }}
            >
              {t('checkout.payment_error_dismiss')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCheckout();
          }}
        >
          {/* PASO 1: CONFIRMACIÓN DE CARRITO */}
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>{t('checkout.confirm_cart_title')}</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 rounded border overflow-hidden">
                      <Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" />
                    </div>
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

          {/* STEP 2: YOUR DETAILS (3 OPTIONS: LOGIN / REGISTER / GUEST) */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline font-bold text-primary">
                  {t('checkout.user_details_title') || 'Your Delivery Details'}
                </CardTitle>
                <CardDescription>
                  {user
                    ? 'You are signed in with your account. Review or edit your delivery details.'
                    : 'Choose how you want to complete your order: log in, create an account, or checkout as a guest.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* IF ALREADY LOGGED IN */}
                {user ? (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {user.displayName || user.email}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-300">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Active Account
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          This order will be saved to your history and accumulate loyalty points.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-xs shrink-0"
                    >
                      <LogOut className="mr-1 h-3.5 w-3.5" /> Switch / Checkout as guest
                    </Button>
                  </div>
                ) : (
                  /* IF NOT LOGGED IN: 3 OPTIONS SELECTOR */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Option 1: Log in */}
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutMode('login');
                          setStep2ValidationLines(null);
                        }}
                        className={cn(
                          'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                          checkoutMode === 'login'
                            ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 bg-card hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-foreground">
                          <LogIn className="h-4 w-4 text-primary" />
                          <span>1. Log in</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Access your saved addresses and earn loyalty rewards.
                        </p>
                      </button>

                      {/* Option 2: Create Account */}
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutMode('register');
                          setStep2ValidationLines(null);
                        }}
                        className={cn(
                          'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                          checkoutMode === 'register'
                            ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 bg-card hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-foreground">
                          <UserPlus className="h-4 w-4 text-primary" />
                          <span>2. Create an account</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Save your profile with this order and earn loyalty points.
                        </p>
                      </button>

                      {/* Option 3: Guest Checkout */}
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutMode('guest');
                          setStep2ValidationLines(null);
                        }}
                        className={cn(
                          'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                          checkoutMode === 'guest'
                            ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 bg-card hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-foreground">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <span>3. Checkout as guest</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          No password required. Just the details needed to ship your order.
                        </p>
                      </button>
                    </div>

                    {/* VIEW BASED ON SELECTED OPTION */}
                    {checkoutMode === 'login' && (
                      <div className="rounded-xl border p-5 bg-card space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <LogIn className="h-5 w-5" />
                          <h3>Sign in to your account</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enter your email and password. Once logged in, your saved details will load and you will earn points.
                        </p>

                        {loginError && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Login Error</AlertTitle>
                            <AlertDescription>{loginError}</AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                              type="email"
                              placeholder="you@email.com"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              disabled={loginLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium">Password</label>
                              <Link
                                href="/forgot-password"
                                target="_blank"
                                className="text-xs text-primary hover:underline"
                              >
                                Forgot your password?
                              </Link>
                            </div>
                            <div className="relative">
                              <Input
                                type={showLoginPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                disabled={loginLoading}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                              >
                                {showLoginPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={handleInlineLogin}
                            disabled={loginLoading}
                            className="w-full sm:w-auto"
                          >
                            {loginLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Log in and load my details
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setCheckoutMode('guest')}
                            className="text-xs text-muted-foreground sm:w-auto"
                          >
                            Prefer to continue as guest
                          </Button>
                        </div>
                      </div>
                    )}

                    {checkoutMode === 'register' && (
                      <Alert className="border-primary/40 bg-primary/5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <AlertTitle>Your account will be created upon completing this step</AlertTitle>
                        <AlertDescription>
                          Enter your desired password below. Your order and addresses will be saved, and you will begin earning loyalty points.
                        </AlertDescription>
                      </Alert>
                    )}

                    {checkoutMode === 'guest' && (
                      <Alert className="border-border bg-muted/40">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <AlertTitle>Guest Checkout</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                          No password required. Fill in your details for shipping and invoice. No account will be created and no loyalty points accumulated.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* STEP 2 VALIDATION ERRORS */}
                {step2ValidationLines && step2ValidationLines.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <AlertTitle>{t('checkout.pay_error_validation_title')}</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        {step2ValidationLines.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* SHIPPING DETAILS FORM (VISIBLE IN GUEST, REGISTER, OR LOGGED IN) */}
                {(user || checkoutMode === 'guest' || checkoutMode === 'register') && (
                  <div className="space-y-4 pt-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      {checkoutMode === 'register' ? 'Account & Delivery Details' : 'Shipping Address & Contact'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.fullname_label') || 'Full Name'}</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.email_label') || 'Email Address'}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                autoComplete="email"
                                placeholder="john@example.com"
                                {...field}
                                disabled={Boolean(user)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Extra password field in register mode */}
                      {!user && checkoutMode === 'register' && (
                        <div className="space-y-2 md:col-span-2 rounded-lg border p-3.5 bg-muted/20">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Password for your new account</label>
                            <span className="text-xs text-muted-foreground">Minimum 6 characters</span>
                          </div>
                          <div className="relative">
                            <Input
                              type={showRegisterPassword ? 'text' : 'password'}
                              placeholder="Create a secure password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              disabled={registerLoading}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                              {showRegisterPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          {registerError && (
                            <p className="text-xs text-destructive font-medium">{registerError}</p>
                          )}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.phone_label') || 'Phone Number'}</FormLabel>
                            <FormControl><Input type="tel" placeholder="+34 600 000 000" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t('checkout.street_label') || 'Street Address'}</FormLabel>
                            <FormControl><Input placeholder="123 Oxford Street, Flat 4" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.city_label') || 'City'}</FormLabel>
                            <FormControl><Input placeholder="London" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.state_label') || 'State / Province'}</FormLabel>
                            <FormControl><Input placeholder="Greater London" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.zip_label') || 'Postal Code'}</FormLabel>
                            <FormControl><Input placeholder="SW1A 1AA" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.country_label') || 'Country'}</FormLabel>
                            <FormControl><Input placeholder="Spain" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 3: REVIEW & PAYMENT */}
          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>{t('checkout.review_title')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-primary/30 bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <AlertTitle>Secure Payment Method</AlertTitle>
                  <AlertDescription>
                    Select how you want to complete your order. Confirmation will occur automatically once the gateway verifies the payment.
                  </AlertDescription>
                </Alert>

                {!user && (
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Completing order as: <strong className="text-foreground">{form.getValues('email')}</strong> (Guest)</span>
                    <span className="text-primary font-medium">No account linked</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={selectedPaymentMethod === 'hilow' ? 'default' : 'outline'}
                    className="h-auto min-h-14 whitespace-normal"
                    onClick={() => setSelectedPaymentMethod('hilow')}
                  >
                    <CreditCard className="mr-2 h-4 w-4 shrink-0" /> Credit / Debit Card (HiLow)
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPaymentMethod === 'nowpayments' ? 'default' : 'outline'}
                    className="h-auto min-h-14 whitespace-normal"
                    onClick={() => setSelectedPaymentMethod('nowpayments')}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4 shrink-0" /> Cryptocurrency (NOWPayments)
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon or promo code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponLoading || !!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponDiscount(0);
                          setCouponCode('');
                        }}
                      >
                        <X className="h-4 w-4 mr-1 text-destructive" /> Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Apply'}
                      </Button>
                    )}
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs px-3 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                      <span className="flex items-center gap-1.5 font-medium">
                        {appliedCoupon.discountType === 'free_shipping' ? (
                          <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                        Active coupon: <strong>{appliedCoupon.code}</strong> · {
                          appliedCoupon.discountType === 'free_shipping'
                            ? '100% Free Shipping'
                            : appliedCoupon.discountType === 'percentage'
                            ? `${appliedCoupon.discountValue}% off`
                            : `${formatPrice(appliedCoupon.discountValue)} discount`
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(finalTotals.subtotal)}</span>
                  </div>
                  {volumeDiscount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Volume discount</span>
                      <span>-{formatPrice(volumeDiscount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Coupon discount ({appliedCoupon?.code})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className={finalTotals.isFreeShipping ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}>
                      {finalTotals.isFreeShipping
                        ? appliedCoupon?.discountType === 'free_shipping'
                          ? 'Free (Coupon applied)'
                          : 'Free'
                        : packlinkQuote
                        ? formatPrice(finalTotals.shippingCost)
                        : packlinkLoading
                        ? 'Calculating…'
                        : 'Pending calculation'}
                    </span>
                  </div>
                  {packlinkQuote && (
                    <div className="text-xs text-muted-foreground">
                      Carrier service: {packlinkQuote.carrierName} · {packlinkQuote.serviceName}
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total to pay</span>
                    <span className="text-primary">{formatPrice(finalTotals.total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4">
                {(payStepDetail || paymentError) && (
                  <Alert variant="destructive" className="text-left">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <AlertTitle>
                      {payStepDetail?.title ??
                        (paymentErrorKind === 'local'
                          ? t('checkout.payment_error_local_order_title')
                          : t('checkout.payment_error_banner_title'))}
                    </AlertTitle>
                    <AlertDescription className="space-y-3">
                      {payStepDetail && payStepDetail.items.length > 0 && (
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                          {payStepDetail.items.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      )}
                      {paymentError && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-destructive-foreground/80">
                            {t('checkout.pay_error_technical_prefix')}
                          </p>
                          <p className="break-words font-medium">{paymentError}</p>
                          <p className="text-sm opacity-90">
                            {paymentErrorKind === 'local'
                              ? t('checkout.payment_error_local_order_hint')
                              : t('checkout.payment_error_banner_hint')}
                          </p>
                        </div>
                      )}
                      {payStepDetail?.hint && (
                        <p className="text-sm border-t border-destructive-foreground/20 pt-2">{payStepDetail.hint}</p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-destructive-foreground/30 text-destructive-foreground sm:w-auto"
                        onClick={() => {
                          setPayStepDetail(null);
                          setPaymentError(null);
                          setPaymentErrorKind(null);
                        }}
                      >
                        {t('checkout.pay_error_clear')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  size="lg"
                  className="w-full text-base font-bold"
                  type="button"
                  disabled={loading}
                  onClick={() => submitCheckout()}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
                  {selectedPaymentMethod === 'nowpayments' ? 'Proceed with NOWPayments' : 'Pay Securely'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP NAVIGATION BUTTONS */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => goToStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {step === 1 && (
              <Button type="button" onClick={handleContinueFromStep1}>
                {t('checkout.next_button') || 'Continue'}
              </Button>
            )}
            {step === 2 && (
              <Button
                type="button"
                onClick={handleContinueFromStep2}
                disabled={packlinkLoading || registerLoading}
              >
                {packlinkLoading || registerLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {registerLoading ? 'Creating account…' : 'Calculating shipping…'}
                  </>
                ) : (
                  <>
                    {user
                      ? 'Proceed to Payment'
                      : checkoutMode === 'register'
                      ? 'Create Account & Proceed to Payment'
                      : checkoutMode === 'guest'
                      ? 'Continue as Guest to Payment'
                      : 'Continue'}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
