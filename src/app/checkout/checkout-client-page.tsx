
"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, ArrowLeft, Lock, Eye, EyeOff, UserCheck, Banknote, CreditCard, Smartphone, FileText, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuantitySelector } from '@/components/quantity-selector';
import { doc, serverTimestamp, setDoc, onSnapshot } from 'firebase/firestore';
import { Order, ShippingAddress } from '@/lib/types';
import { useCheckout } from '@/context/checkout-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { createOrder } from '@/app/actions/checkout';
import { Switch } from '@/components/ui/switch';


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
const baseRegistrationSchema = z.object({
    name: z.string().min(3, "El nombre es requerido."),
    email: z.string().email("Por favor, introduce un email válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
    confirmPassword: z.string().min(6, "Debes confirmar la contraseña.").optional(),
});

const shippingSchema = z.object({
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().min(3, "El código postal es requerido."),
  country: z.string().min(2, "El país es requerido."),
});

const billingSchema = z.object({
  billing_name: z.string().min(3, "El nombre de facturación es requerido."),
  billing_street: z.string().min(5, "La calle de facturación es requerida."),
  billing_city: z.string().min(2, "La ciudad de facturación es requerida."),
  billing_state: z.string().min(2, "El estado/provincia de facturación es requerido."),
  billing_postalCode: z.string().min(3, "El código postal de facturación es requerido."),
  billing_country: z.string().min(2, "El país de facturación es requerido."),
}).optional();

// Combined schema with conditional validation
const finalCheckoutSchema = baseRegistrationSchema.merge(shippingSchema).merge(z.object({
    paymentMethod: z.enum(['cod_cash', 'cod_card', 'cod_bizum', 'prepaid_bizum', 'prepaid_transfer'], {
        required_error: "Debes seleccionar un método de pago."
    }),
    userId: z.string().optional(),
    useDifferentBilling: z.boolean().default(false),
    billing: billingSchema,
})).superRefine((data, ctx) => {
    // Password validation for guest checkout
    if (!data.userId) { 
        if (!data.password || data.password.length < 6) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La contraseña debe tener al menos 6 caracteres.", path: ["password"] });
        }
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las contraseñas no coinciden.", path: ["confirmPassword"] });
        }
    }
    // Billing address validation if checkbox is checked
    if (data.useDifferentBilling) {
        if (!data.billing?.billing_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing.billing_name"] });
        if (!data.billing?.billing_street) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing.billing_street"] });
        if (!data.billing?.billing_city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing.billing_city"] });
        if (!data.billing?.billing_state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing.billing_state"] });
        if (!data.billing?.billing_postalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing.billing_postalCode"] });
        if (!data.billing?.billing_country) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido.", path: ["billing.billing_country"] });
    }
});

type CheckoutFormValues = z.infer<typeof finalCheckoutSchema>;

// --- Helper Functions ---
const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

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
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user, loading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { setCheckoutData } = useCheckout();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(finalCheckoutSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'España', paymentMethod: 'cod_cash', useDifferentBilling: false },
  });
  
  const formValues = form.watch();

    useEffect(() => {
        if (!isUserLoading && cartCount === 0 && !loading) {
        router.push('/');
        }
    }, [cartCount, router, loading, isUserLoading]);
    
    // Fetch user addresses
    useEffect(() => {
        if (!user) {
            setAddresses([]);
            return;
        };
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const userAddresses = userData.addresses || [];
                setAddresses(userAddresses);
                // Pre-select default address if it exists
                const defaultAddress = userAddresses.find((addr: Address) => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                    form.setValue('name', defaultAddress.name);
                    form.setValue('phone', defaultAddress.phone);
                    form.setValue('street', defaultAddress.street);
                    form.setValue('city', defaultAddress.city);
                    form.setValue('state', defaultAddress.state);
                    form.setValue('postalCode', defaultAddress.postalCode);
                    form.setValue('country', defaultAddress.country);
                }
            }
        });
        return () => unsubscribe();
    }, [user, form]);
    
    useEffect(() => {
        if (isRegistering && user) {
            setIsRegistering(false);
            setStep(3); 
        }
        if (user) {
        if (!form.getValues('email')) form.setValue('email', user.email || '');
        if (!form.getValues('name')) form.setValue('name', user.displayName || user.email?.split('@')[0] || '');
        form.setValue('userId', user.uid);
        } else {
        form.setValue('userId', undefined);
        }
    }, [user, form, isRegistering]);
    
    const handleAddressSelection = (addressId: string) => {
        setSelectedAddressId(addressId);
        if (addressId === 'new') {
            form.reset({ 
                ...form.getValues(), 
                name: user?.displayName || user?.email?.split('@')[0] || '',
                street: '', city: '', state: '', postalCode: '', phone: '', country: 'España' 
            });
        } else {
            const selectedAddr = addresses.find(a => a.id === addressId);
            if (selectedAddr) {
                form.setValue('name', selectedAddr.name);
                form.setValue('phone', selectedAddr.phone);
                form.setValue('street', selectedAddr.street);
                form.setValue('city', selectedAddr.city);
                form.setValue('state', selectedAddr.state);
                form.setValue('postalCode', selectedAddr.postalCode);
                form.setValue('country', selectedAddr.country);
            }
        }
    };


  const handleGuestRegistration = async () => {
    if (!auth) {
        toast({ title: 'Error', description: 'El servicio no está disponible.', variant: 'destructive' });
        return;
    }

    const fieldsToValidate: (keyof CheckoutFormValues)[] = ['name', 'email', 'password', 'confirmPassword', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) return;

    setIsRegistering(true);
    setLoading(true);
    toast({ title: 'Creando tu cuenta...', description: 'Por favor, espera un momento.' });

    const data = form.getValues();
    const { name, email, password } = data;

    try {
        if (!password) throw new Error("La contraseña es obligatoria.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        const userDocRef = doc(db, "users", newUser.uid);
        await setDoc(userDocRef, { 
            uid: newUser.uid, email: newUser.email, displayName: name, creationTime: serverTimestamp(), loyaltyPoints: 0, isSubscribed: false 
        });

        await signInWithEmailAndPassword(auth, email, password);
        
        toast({ title: "Cuenta Creada", description: "¡Bienvenido! Continúa con tu pedido..." });
        
    } catch (error: any) {
        setIsRegistering(false);
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
            toast({
                title: 'Email ya registrado', description: 'Este email ya tiene una cuenta. Por favor, inicia sesión para continuar.', variant: 'destructive', action: <Button onClick={() => router.push('/login?redirect=/checkout')}>Iniciar Sesión</Button>, duration: 10000,
            });
        } else {
            toast({ title: 'Error de Registro', description: error.message || 'No se pudo crear la cuenta.', variant: 'destructive' });
        }
    }
  };


  const handleNextStep = async () => {
    if (!user && step === 2) {
        await handleGuestRegistration();
        return;
    }

    let fieldsToValidate: (keyof CheckoutFormValues)[] = [];
    if (step === 2) {
      const baseFields: (keyof CheckoutFormValues)[] = ['name', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
      if(!user) {
        // For guests, password fields are required
        fieldsToValidate = [...baseFields, 'email', 'password', 'confirmPassword'];
      } else {
        fieldsToValidate = baseFields;
      }

      if(form.getValues('useDifferentBilling')) {
        fieldsToValidate.push('billing');
      }
    }
    if (step === 3) fieldsToValidate = ['paymentMethod'];
    
    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    if (isValid) setStep(prev => prev + 1);
  };

  const handlePrevStep = () => { setStep(prev => prev - 1); };
  
  const onFinalSubmit = async (data: CheckoutFormValues) => {
    setLoading(true);
    try {
      if (!user) {
        toast({ title: 'Error de Autenticación', description: 'Debes iniciar sesión para completar el pedido. Por favor, vuelve atrás y comprueba tus datos.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      toast({ title: 'Procesando tu pedido...', description: 'Por favor, espera un momento.' });
  
      const shippingAddress: ShippingAddress = { line1: data.street, line2: null, city: data.city, state: data.state, postal_code: data.postalCode, country: data.country, phone: data.phone };
      
      const result = await createOrder({
          userId: user.uid, cartItems: cartItems, cartTotal: cartTotal, customerName: data.name, customerEmail: data.email, shippingAddress: shippingAddress, paymentMethod: data.paymentMethod,
      });
  
      if (result.error || !result.orderId) throw new Error(result.error || "No se pudo obtener el ID del pedido.");
      
      const orderSummaryForUI: Order = {
          id: result.orderId, userId: user.uid, createdAt: new Date(), status: 'Reserva Recibida', total: cartTotal, items: cartItems.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, imageUrl: item.imageUrl, })), customerName: data.name, customerEmail: data.email, shippingAddress: shippingAddress, paymentMethod: data.paymentMethod,
      };
  
      setCheckoutData({ orderId: result.orderId, paymentMethod: data.paymentMethod, orderSummary: orderSummaryForUI });
      clearCart();
      router.push('/checkout/success');
  
    } catch (error: any) {
        console.error("Order Creation Error: ", error);
        toast({ title: 'Error al realizar el pedido', description: error.message || 'Ocurrió un error al guardar tu pedido.', variant: 'destructive' });
        setLoading(false);
    }
  };

  if ((isUserLoading && !user) || (cartCount === 0 && !loading)) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Cargando carrito...</p>
        </div>
    );
  }

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
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>2. Tus Datos</CardTitle>
                        <p className="text-muted-foreground">{user ? 'Confirma tus datos de envío.' : 'Crea una cuenta y dinos dónde enviar tu pedido.'}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!user ? (
                            <>
                                <h3 className="font-bold text-lg">Datos de la Cuenta</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel><Mail className="inline-block mr-2"/>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel><Lock className="inline-block mr-2" />Crear Contraseña</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} className="pr-10" /><Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}><EyeOff className={cn(showPassword ? 'block' : 'hidden')} /><Eye className={cn(showPassword ? 'hidden' : 'block')} /></Button></div></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} {...field} className="pr-10" /><Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><EyeOff className={cn(showConfirmPassword ? 'block' : 'hidden')} /><Eye className={cn(showConfirmPassword ? 'hidden' : 'block')} /></Button></div></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Separator />
                            </>
                        ) : (
                            addresses.length > 0 && (
                                <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelection} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                        <Label key={addr.id} htmlFor={addr.id} className={cn("flex flex-col rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors", selectedAddressId === addr.id && "border-primary ring-2 ring-primary")}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">{addr.alias}</span>
                                                <RadioGroupItem value={addr.id} id={addr.id} />
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2">
                                                <p>{addr.street}</p>
                                                <p>{addr.postalCode} {addr.city}</p>
                                            </div>
                                        </Label>
                                    ))}
                                    <Label htmlFor="new" className={cn("flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-accent/50 transition-colors", selectedAddressId === 'new' && "border-primary ring-2 ring-primary bg-accent/50")}>
                                        <PlusCircle className="h-5 w-5" />
                                        <span>Usar nueva dirección</span>
                                        <RadioGroupItem value="new" id="new" className="sr-only" />
                                    </Label>
                                </RadioGroup>
                            )
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
                        </div>

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
                                <FormField control={form.control} name="billing.billing_name" render={({ field }) => (<FormItem><FormLabel><User className="inline-block mr-2"/>Nombre Completo (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billing.billing_street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>Calle (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billing.billing_city" render={({ field }) => (<FormItem><FormLabel>Ciudad (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billing.billing_state" render={({ field }) => (<FormItem><FormLabel>Provincia (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billing.billing_postalCode" render={({ field }) => (<FormItem><FormLabel>Código Postal (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billing.billing_country" render={({ field }) => (<FormItem><FormLabel>País (Factura)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader><CardTitle>3. Método de Pago</CardTitle></CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                            <FormItem className="space-y-3"><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"><FormControl><RadioGroupItem value="cod_cash" /></FormControl><FormLabel className="font-normal w-full flex items-center gap-3 cursor-pointer"><Banknote/>Pagar en efectivo contra-entrega</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"><FormControl><RadioGroupItem value="cod_card" /></FormControl><FormLabel className="font-normal w-full flex items-center gap-3 cursor-pointer"><CreditCard/>Pagar con tarjeta contra-entrega</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"><FormControl><RadioGroupItem value="cod_bizum" /></FormControl><FormLabel className="font-normal w-full flex items-center gap-3 cursor-pointer"><Smartphone/>Pagar con Bizum contra-entrega</FormLabel></FormItem>
                                <Separator className="my-4"/><p className="text-sm text-muted-foreground px-1">O paga por adelantado y recibe un regalo:</p>
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"><FormControl><RadioGroupItem value="prepaid_bizum" /></FormControl><FormLabel className="font-normal w-full flex items-center gap-3 cursor-pointer"><Smartphone/>Pago anticipado con Bizum <span className="text-primary font-bold">(+Regalo)</span></FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"><FormControl><RadioGroupItem value="prepaid_transfer" /></FormControl><FormLabel className="font-normal w-full flex items-center gap-3 cursor-pointer"><Banknote/>Pago anticipado con Transferencia <span className="text-primary font-bold">(+Regalo)</span></FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )} />
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
                                {formValues.useDifferentBilling && formValues.billing ? (
                                    <div className="text-sm text-muted-foreground">
                                        <p>{formValues.billing.billing_name}</p>
                                        <p>{formValues.billing.billing_street}</p>
                                        <p>{formValues.billing.billing_city}, {formValues.billing.billing_state}, {formValues.billing.billing_postalCode}</p>
                                        <p>{formValues.billing.billing_country}</p>
                                    </div>
                                ) : (<p className="text-sm text-muted-foreground">La misma que la de envío.</p>)}
                            </div>
                        </div>
                         <div><h3 className="font-semibold mb-2">Método de Pago:</h3><div className="text-sm text-muted-foreground"><p>{formValues.paymentMethod?.replace(/_/g, ' ')}</p></div></div>
                        <Separator />
                        <div className="flex justify-between font-bold text-xl"><span>Total a Pagar</span><span className="text-primary">{formatPrice(cartTotal)}</span></div>
                         <p className="text-xs text-muted-foreground text-center">{formValues.paymentMethod?.startsWith('prepaid') ? 'Recibirás las instrucciones de pago por email.' : 'El pago se realizará contra-entrega.'} Revisa tu email para más detalles.</p>
                    </CardContent>
                    <CardFooter>
                         <Button size="lg" type="submit" className="w-full" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Confirmando...</> : 'Confirmar Pedido'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="mt-8 flex justify-between">
                {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrevStep}><ArrowLeft className="mr-2" /> Anterior</Button>) : (<Button asChild type="button" variant="outline"><Link href="/products">&larr; Seguir Comprando</Link></Button>)}
                {step < 4 && (<Button type="button" onClick={handleNextStep} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Siguiente'}</Button>)}
            </div>
        </form>
      </Form>
    </div>
  );
}

    
