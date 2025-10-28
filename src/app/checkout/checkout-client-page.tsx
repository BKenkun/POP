
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, ArrowLeft, Lock, Eye, EyeOff, UserPlus, Banknote, CreditCard, Smartphone, FileText, PlusCircle, AlertCircle, UserCheck, Gift, Bitcoin } from 'lucide-react';
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
import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { ShippingAddress } from '@/lib/types';
import { useCheckout } from '@/context/checkout-context';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';
import { updateUser } from '@/app/actions/user-data';
import { createNowPaymentsInvoice } from '@/app/actions/nowpayments';


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

// --- Validation Schemas ---
const checkoutSchema = z.object({
    name: z.string().min(3, "El nombre es requerido."),
    email: z.string().email("Por favor, introduce un email válido."),
    phone: z.string().min(9, "El teléfono es requerido."),
    street: z.string().min(5, "La calle es requerida."),
    city: z.string().min(2, "La ciudad es requerida."),
    state: z.string().min(2, "El estado/provincia es requerido."),
    postalCode: z.string().min(3, "El código postal es requerido."),
    country: z.string().min(2, "El país es requerido."),
    saveAddress: z.boolean().default(false), // New field to save the address
    paymentMethod: z.enum(['cod_cash', 'cod_card', 'cod_bizum', 'prepaid_bizum', 'prepaid_transfer', 'crypto'], {
        required_error: "Debes seleccionar un método de pago."
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
        if (!data.billing_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing_name"] });
        if (!data.billing_street) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing_street"] });
        if (!data.billing_city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing_city"] });
        if (!data.billing_state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing_state"] });
        if (!data.billing_postalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing_postalCode"] });
        if (!data.billing_country) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing_country"] });
    }
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

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
const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [{ number: 1, name: 'Carrito' }, { number: 2, name: 'Tus Datos' }, { number: 3, name: 'Pago' }, { number: 4, name: 'Revisión' }];
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
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart, volumeDiscount } = useCart();
  const { user, loading: isUserLoading, userDoc, setUserDoc } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [paymentCategory, setPaymentCategory] = useState<'cod' | 'prepaid' | null>('prepaid');

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
        country: 'España',
        saveAddress: false,
        paymentMethod: 'prepaid_bizum', // Default to a prepaid method
        useDifferentBilling: false 
    },
  });
  
  const formValues = form.watch();

  const isPrepaid = useMemo(() => {
      const method = form.getValues('paymentMethod');
      return method.startsWith('prepaid') || method === 'crypto';
  }, [form.watch('paymentMethod')]);

  const finalTotals = useMemo(() => {
    const subtotal = cartTotal;
    const discount = isPrepaid ? (volumeDiscount || 0) : 0;
    const subtotalWithDiscount = subtotal - discount;
    
    let shipping = 0;
    if (!isPrepaid) {
        if (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD) {
            shipping = SHIPPING_COST;
        }
    }
    
    const total = subtotalWithDiscount + shipping;

    return { subtotal, discount, shipping, total };
  }, [cartTotal, volumeDiscount, isPrepaid]);


    useEffect(() => {
        if (!isUserLoading && cartCount === 0 && !loading) {
        router.push('/');
        }
    }, [cartCount, router, loading, isUserLoading]);
    
    useEffect(() => {
        if (user && userDoc) {
            form.setValue('email', user.email || '');
            form.setValue('name', user.displayName || user.email?.split('@')[0] || '');
            
            const userAddresses: Address[] = userDoc.addresses || [];
            const defaultAddress = userAddresses.find(addr => addr.isDefault);
            
            if (defaultAddress) {
                handleAddressSelection(defaultAddress.id, userAddresses);
            }
        }
    }, [user, userDoc, form.setValue]);
    
    const handleAddressSelection = (addressId: string, currentAddresses: Address[] = userDoc?.addresses || []) => {
        setSelectedAddressId(addressId);
        form.setValue('email', user?.email || ''); 
        
        if (addressId === 'new') {
            form.reset({ 
                ...form.getValues(),
                email: user?.email || '',
                name: user?.displayName || user?.email?.split('@')[0] || '',
                phone: '',
                street: '', 
                city: '', 
                state: '', 
                postalCode: '', 
                country: 'España',
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
            }
        }
    };


  const handleNextStep = async () => {
    let isValid = false;
    if (step === 2) {
      if (!user) {
         toast({
            title: "Requiere inicio de sesión",
            description: "Por favor, inicia sesión o regístrate para continuar.",
            variant: "destructive",
         });
         router.push('/login?redirect=/checkout');
         return;
      }
      const fieldsToValidate: (keyof CheckoutFormValues)[] = ['name', 'email', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
      if (form.getValues('useDifferentBilling')) {
        fieldsToValidate.push('billing_name', 'billing_street', 'billing_city', 'billing_state', 'billing_postalCode', 'billing_country');
      }
      isValid = await form.trigger(fieldsToValidate);
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
      toast({ title: 'Error de Autenticación', description: 'Debes iniciar sesión para completar el pedido.', variant: 'destructive' });
      setStep(2);
      return;
    }
    setLoading(true);

    if (data.saveAddress && selectedAddressId === 'new') {
        const addressToSave = {
            alias: `Dirección ${userDoc?.addresses?.length + 1 || 1}`,
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
            toast({ title: "Dirección Guardada", description: "Tu nueva dirección se ha guardado en tu perfil." });
        } else {
             toast({ title: "Error", description: "No se pudo guardar la dirección, pero puedes continuar con el pedido.", variant: "destructive" });
        }
    }


    // Crypto payment logic
    if (data.paymentMethod === 'crypto') {
        try {
            const result = await createNowPaymentsInvoice({
                price_amount: finalTotals.total / 100, // Convert cents to euros/dollars
                price_currency: 'eur',
                order_id: `order_${user.uid}_${Date.now()}`,
                order_description: `Pedido de ${cartCount} productos en PuroRush`
            });

            if (result.success && result.invoice_url) {
                window.location.href = result.invoice_url; // Redirect user to NOWPayments
            } else {
                throw new Error(result.error || 'No se pudo crear el enlace de pago con criptomonedas.');
            }
        } catch (error: any) {
            toast({ title: 'Error con Pago Cripto', description: error.message, variant: 'destructive' });
            setLoading(false);
        }
        return; // Stop execution for crypto payments
    }


    // Logic for other payment methods
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
        
        const orderCollectionRef = collection(db, 'users', user.uid, 'orders');
        const newOrderRef = await addDoc(orderCollectionRef, {
            userId: user.uid,
            status: 'Reserva Recibida',
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
            })
        });
        
        const pointsToAdd = Math.floor(finalTotals.total / 1000);
        if (pointsToAdd > 0) {
            const result = await updateUser('update-points', { pointsToAdd });
            if (result.success && result.user) {
                setUserDoc(result.user);
                 toast({
                    title: "¡Puntos Ganados!",
                    description: `Has ganado ${pointsToAdd} puntos de fidelidad con esta compra.`,
                });
            }
        }

        toast({
            duration: 10000,
            title: "¡Reserva Confirmada!",
            description: `Tu pedido #${newOrderRef.id.substring(newOrderRef.id.length - 7)} ha sido recibido.`,
            action: (
                <div className="flex flex-col gap-2">
                    <ToastAction asChild altText="Ver Pedido">
                        <Link href={`/account/orders/${newOrderRef.id}`}>Ver Pedido</Link>
                    </ToastAction>
                    <ToastAction asChild altText="Seguir Comprando">
                        <Link href="/">Seguir Comprando</Link>
                    </ToastAction>
                </div>
            ),
        });

        clearCart();
        router.push('/');

    } catch (error: any) {
        console.error("Order Creation Error: ", error);
        toast({ title: 'Error al realizar el pedido', description: error.message || 'Ocurrió un error al guardar tu pedido.', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  const paymentMethods = {
      cod: [
          { value: 'cod_cash', label: 'Pagar en efectivo contra-entrega', icon: Banknote },
          { value: 'cod_card', label: 'Pagar con tarjeta contra-entrega', icon: CreditCard },
          { value: 'cod_bizum', label: 'Pagar con Bizum contra-entrega', icon: Smartphone }
      ],
      prepaid: [
          { value: 'prepaid_bizum', label: 'Pago anticipado con Bizum', icon: Smartphone },
          { value: 'prepaid_transfer', label: 'Pago anticipado con Transferencia', icon: Banknote },
          { value: 'crypto', label: 'Pagar con Criptomonedas', icon: Bitcoin },
      ]
  };

  if ((isUserLoading && !user) || (cartCount === 0 && !loading)) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Cargando carrito...</p>
        </div>
    );
  }

  const addresses = userDoc?.addresses || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center font-bold">Finalizar Pedido</h1>
      <Stepper currentStep={step} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinalSubmit)}>
            {step === 1 && (
                <Card>
                    <CardHeader><CardTitle>1. Confirma tu Carrito</CardTitle></CardHeader>
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
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                             {volumeDiscount > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>Descuento por volumen</span>
                                    <span>-{formatPrice(volumeDiscount)}</span>
                                </div>
                            )}
                             <div className="flex justify-between font-bold text-lg">
                                <span>Total (antes de envío)</span>
                                <span>{formatPrice(cartTotal - (volumeDiscount || 0))}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>2. Tus Datos</CardTitle>
                        <p className="text-muted-foreground">{user ? 'Confirma tus datos de envío.' : 'Inicia sesión para continuar.'}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!user ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Inicio de Sesión Requerido</AlertTitle>
                                <AlertDescription>
                                    Debes iniciar sesión o registrarte para poder continuar con tu pedido.
                                    <div className="mt-4 flex gap-4">
                                        <Button asChild><Link href="/login?redirect=/checkout">Iniciar Sesión</Link></Button>
                                        <Button asChild variant="outline"><Link href="/register">Registrarse</Link></Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ) : (
                           <>
                                {addresses.length > 0 && (
                                    <RadioGroup value={selectedAddressId} onValueChange={(id) => handleAddressSelection(id, addresses)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr: Address, index: number) => (
                                            <Label key={addr.id} htmlFor={addr.id} className={cn("flex flex-col rounded-lg border p-4 cursor-pointer hover:bg-primary/10 transition-colors", selectedAddressId === addr.id && "border-primary ring-2 ring-primary")}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">{addr.alias || `Dirección ${index + 1}`}</span>
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
                                            <span>Usar nueva dirección</span>
                                            <RadioGroupItem value="new" id="new" className="sr-only" />
                                        </Label>
                                    </RadioGroup>
                                )}
                                <div className={cn(user && addresses.length > 0 && selectedAddressId !== 'new' && "hidden")}>
                                    <h3 className="font-bold text-lg mb-4">Dirección de Envío</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel><Phone className="inline-block mr-2"/>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>Calle y número</FormLabel><FormControl><Input placeholder="Calle Falsa 123, 4º B" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado / Provincia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    {selectedAddressId === 'new' && (
                                        <FormField control={form.control} name="saveAddress" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                                                <FormLabel className="mb-0">Guardar esta dirección para futuras compras</FormLabel>
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
                                            <FormLabel className="text-base">Usar una dirección de facturación diferente</FormLabel>
                                            <p className="text-sm text-muted-foreground">Activa esta opción si los datos de facturación no coinciden con los de envío.</p>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )} />
        
                                {formValues.useDifferentBilling && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-bold text-lg">Dirección de Facturación</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="billing_name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>Nombre Completo (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>Calle (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_city" render={({ field }) => (<FormItem><FormLabel>Ciudad (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_state" render={({ field }) => (<FormItem><FormLabel>Provincia (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_postalCode" render={({ field }) => (<FormItem><FormLabel>Código Postal (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="billing_country" render={({ field }) => (<FormItem><FormLabel>País (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                    <CardHeader><CardTitle>3. Método de Pago</CardTitle></CardHeader>
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
                                            <span className="font-bold">Contrareembolso</span>
                                            <span className="text-xs text-muted-foreground">(Paga al recibir)</span>
                                        </Label>
                                        <Label htmlFor="cat-prepaid" className={cn("flex flex-col items-center justify-center rounded-lg border p-4 cursor-pointer transition-colors hover:bg-primary/10", paymentCategory === 'prepaid' && "border-primary ring-2 ring-primary")}>
                                            <RadioGroupItem value="prepaid" id="cat-prepaid" className="sr-only" />
                                            <Banknote className="mb-2 h-8 w-8" />
                                            <span className="font-bold">Pago por adelantado</span>
                                            <span className="text-xs text-primary">(¡Con Descuento, Envío Gratis y Regalo!)</span>
                                        </Label>
                                    </RadioGroup>

                                    {paymentCategory && (
                                        <div className="pt-4 mt-4 border-t">
                                            {paymentCategory === 'prepaid' && (
                                                <Alert variant="default" className="mb-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                                                    <Gift className="h-4 w-4 !text-green-600" />
                                                    <AlertTitle className="text-green-800 dark:text-green-300">¡Beneficios Exclusivos!</AlertTitle>
                                                    <AlertDescription className="text-green-700 dark:text-green-400">
                                                        Al pagar por adelantado, disfrutas de <span className="font-bold">descuento por volumen, envío gratuito y un regalo sorpresa</span> en tu pedido.
                                                    </AlertDescription>
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
                    <CardHeader><CardTitle>4. Revisa y Confirma tu Pedido</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div><h3 className="font-semibold mb-2">Productos:</h3>{cartItems.map((item) => (<div key={item.id} className="flex items-center gap-4 py-1"><div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border"><Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" /></div><div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p></div><p className="font-medium">{formatPrice(item.price * item.quantity)}</p></div>))}</div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><h3 className="font-semibold mb-2">Dirección de Envío:</h3><div className="text-sm text-muted-foreground"><p>{formValues.name}</p><p>{formValues.phone}</p><p>{formValues.street}</p><p>{formValues.city}, {formValues.state}, {formValues.postalCode}</p><p>{formValues.country}</p></div></div>
                            <div>
                                <h3 className="font-semibold mb-2">Dirección de Facturación:</h3>
                                {formValues.useDifferentBilling ? (
                                    <div className="text-sm text-muted-foreground">
                                        <p>{formValues.billing_name}</p>
                                        <p>{formValues.billing_street}</p>
                                        <p>{formValues.billing_city}, {formValues.billing_state}, {formValues.billing_postalCode}</p>
                                        <p>{formValues.billing_country}</p>
                                    </div>
                                ) : (<p className="text-sm text-muted-foreground">La misma que la de envío.</p>)}
                            </div>
                        </div>
                         <div><h3 className="font-semibold mb-2">Método de Pago:</h3><div className="text-sm text-muted-foreground"><p>{paymentMethods[form.getValues('paymentMethod').startsWith('cod') ? 'cod' : 'prepaid'].find(m => m.value === formValues.paymentMethod)?.label}</p></div></div>
                        <Separator />
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(finalTotals.subtotal)}</span>
                            </div>
                            {finalTotals.discount > 0 && (
                                <div className="flex justify-between text-destructive">
                                    <span>Descuento por pago adelantado</span>
                                    <span>-{formatPrice(finalTotals.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Envío</span>
                                <span>{finalTotals.shipping > 0 ? formatPrice(finalTotals.shipping) : 'Gratis'}</span>
                            </div>
                            <Separator/>
                            <div className="flex justify-between font-bold text-xl">
                                <span>Total a Pagar</span>
                                <span className="text-primary">{formatPrice(finalTotals.total)}</span>
                            </div>
                        </div>
                         <p className="text-xs text-muted-foreground text-center">{formValues.paymentMethod?.startsWith('prepaid') ? 'Recibirás las instrucciones de pago por email.' : 'El pago se realizará contra-entrega.'} Revisa tu email para más detalles.</p>
                    </CardContent>
                </Card>
            )}

            <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrevStep}><ArrowLeft className="mr-2" /> Anterior</Button>) : (<Button asChild type="button" variant="outline"><Link href="/products">&larr; Seguir Comprando</Link></Button>)}
                
                {step < 4 && (<Button type="button" onClick={handleNextStep} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Siguiente'}</Button>)}
                
                {step === 4 && (
                    <Button size="lg" type="submit" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Confirmando...</> : 'Confirmar Pedido'}
                    </Button>
                )}
            </div>
        </form>
      </Form>
    </div>
  );
}
