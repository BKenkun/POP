
"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, ArrowLeft, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
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
import { QuantitySelector } from '@/components/quantity-selector';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Order, ShippingAddress } from '@/lib/types';
import { useCheckout } from '@/context/checkout-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// --- Validation Schemas ---
const registrationSchema = z.object({
    name: z.string().min(3, "El nombre es requerido."),
    email: z.string().email("Por favor, introduce un email válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Debes confirmar la contraseña."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

const shippingSchema = z.object({
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().min(3, "El código postal es requerido."),
  country: z.string().min(2, "El país es requerido."),
});

// Combined schema for final submission
const finalCheckoutSchema = registrationSchema.merge(shippingSchema);
type CheckoutFormValues = z.infer<typeof finalCheckoutSchema>;

// --- Helper Functions ---
const generateOrderCode = (): string => {
  const prefix = "P";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = '';
  for (let i = 0; i < 7; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${result}`;
}

// --- Components ---
const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [{ number: 1, name: 'Carrito' }, { number: 2, name: 'Tus Datos' }, { number: 3, name: 'Revisión' }];
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
  const firestore = useFirestore();
  const { auth, user, isUserLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { setCheckoutData } = useCheckout();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dataStep, setDataStep] = useState<'register' | 'shipping'>('register');

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(finalCheckoutSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'España' },
  });
  
  const formValues = form.watch();

  useEffect(() => {
    if (!isUserLoading && cartCount === 0 && !loading) {
       router.push('/');
    }
  }, [cartCount, router, loading, isUserLoading]);
  
  useEffect(() => {
    if (user) {
      form.setValue('email', user.email || '');
      form.setValue('name', user.displayName || user.email?.split('@')[0] || '');
      setDataStep('shipping'); // If user is logged in, skip registration form
    } else {
      setDataStep('register');
    }
  }, [user, form]);

  const handleNextStep = async () => {
    if (step === 2) {
      let isValid = false;
      if (dataStep === 'register') {
        isValid = await form.trigger(['name', 'email', 'password', 'confirmPassword']);
        if (isValid) await handleRegistration();
      } else { // shipping
        isValid = await form.trigger(['phone', 'street', 'city', 'state', 'postalCode', 'country']);
        if (isValid) setStep(prev => prev + 1);
      }
    } else { // Step 1 to 2
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
      // Don't let a newly registered user go back to the registration form
      if (step === 2 && dataStep === 'shipping' && !user) {
          return;
      }
      setStep(prev => prev - 1);
  };

  const handleRegistration = async () => {
    if (!firestore || !auth) {
        toast({ title: 'Error', description: 'El servicio no está disponible.', variant: 'destructive' });
        return;
    }
    setLoading(true);

    const { name, email, password } = form.getValues();
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password!);
        const newUser = userCredential.user;
        const userDocRef = doc(firestore, "users", newUser.uid);
        await setDoc(userDocRef, { uid: newUser.uid, email: newUser.email, displayName: name, createdAt: serverTimestamp(), loyaltyPoints: 0, isSubscribed: false });
        
        // Force sign-in again to ensure context updates
        await signInWithEmailAndPassword(auth, email, password!);

        toast({ title: "Cuenta Creada", description: "Ahora completa tus datos de envío." });
        setDataStep('shipping'); // Move to next part of the form
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            toast({ title: 'Email ya registrado', description: 'Este email ya tiene una cuenta. Por favor, inicia sesión.', variant: 'destructive', action: <Button onClick={() => router.push('/login')}>Iniciar Sesión</Button> });
        } else {
            toast({ title: 'Error de Registro', description: error.message || 'No se pudo crear la cuenta.', variant: 'destructive' });
        }
    } finally {
        setLoading(false);
    }
  };
  
  const onFinalSubmit = async (data: CheckoutFormValues) => {
    if (!firestore || !user) {
        toast({ title: 'Error', description: 'Debes estar autenticado para finalizar el pedido.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    toast({ title: 'Procesando tu pedido...', description: 'Por favor, espera un momento.' });

    try {
        const orderId = generateOrderCode();
        const shippingAddress: ShippingAddress = { line1: data.street, line2: null, city: data.city, state: data.state, postal_code: data.postalCode, country: data.country };
        const orderPayload: Omit<Order, 'createdAt' | 'id'> = {
            userId: user.uid,
            status: 'Reserva Recibida',
            total: cartTotal,
            items: cartItems.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, imageUrl: item.imageUrl })),
            customerName: data.name,
            customerEmail: user.email!,
            shippingAddress: shippingAddress,
            paymentMethod: 'cod_cash',
        };
        
        const orderDocRef = doc(firestore, 'orders', orderId);
        await setDoc(orderDocRef, { ...orderPayload, createdAt: serverTimestamp() });

        const orderSummaryForUI = { ...orderPayload, id: orderId, createdAt: new Date() };
        setCheckoutData({ orderId, paymentMethod: 'cod_cash', orderSummary: orderSummaryForUI as any });
        
        clearCart();
        router.push('/checkout/success');
    } catch (error: any) {
        console.error("Order Error: ", error);
        toast({ title: 'Error al realizar el pedido', description: error.message || 'Ocurrió un error.', variant: 'destructive' });
        setLoading(false);
    }
  };

  if ((isUserLoading && !user) || (cartCount === 0 && !loading)) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando carrito...</p>
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
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border"><Image src={item.imageUrl} alt={item.name} fill className="object-cover" /></div>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
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
                    {dataStep === 'register' && !user && (
                        <>
                        <CardHeader>
                            <CardTitle>2a. Crea tu Cuenta</CardTitle>
                            <p className="text-muted-foreground">Regístrate para continuar y disfrutar de beneficios exclusivos.</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel><User className="inline-block mr-2"/>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel><Mail className="inline-block mr-2"/>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel><Lock className="inline-block mr-2" />Crear Contraseña</FormLabel>
                                    <FormControl><div className="relative">
                                        <Input type={showPassword ? 'text' : 'password'} {...field} className="pr-10" />
                                        <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}><EyeOff className={cn(showPassword ? 'block' : 'hidden')} /><Eye className={cn(showPassword ? 'hidden' : 'block')} /></Button>
                                    </div></FormControl><FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>Confirmar Contraseña</FormLabel>
                                    <FormControl><div className="relative">
                                         <Input type={showConfirmPassword ? 'text' : 'password'} {...field} className="pr-10" />
                                         <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><EyeOff className={cn(showConfirmPassword ? 'block' : 'hidden')} /><Eye className={cn(showConfirmPassword ? 'hidden' : 'block')} /></Button>
                                    </div></FormControl><FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                        </>
                    )}
                    {dataStep === 'shipping' && (
                         <>
                         <CardHeader>
                            <CardTitle>2b. Datos de Envío</CardTitle>
                            <p className="text-muted-foreground">¿Dónde te lo enviamos?</p>
                        </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel><Phone className="inline-block mr-2"/>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>Calle y número</FormLabel><FormControl><Input placeholder="Calle Falsa 123, 4º B" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado / Provincia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         </CardContent>
                         </>
                    )}
                </Card>
            )}
            
            {step === 3 && (
                <Card>
                    <CardHeader><CardTitle>3. Revisa y Confirma tu Pedido</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Productos:</h3>
                             {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-1">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border"><Image src={item.imageUrl} alt={item.name} fill className="object-cover" /></div>
                                    <div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p></div>
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div>
                             <h3 className="font-semibold mb-2">Tus Datos:</h3>
                             <div className="text-sm text-muted-foreground">
                                 <p>{formValues.name}</p>
                                 <p>{user?.email}</p>
                                 <p>{formValues.phone}</p>
                                 <p>{formValues.street}</p>
                                 <p>{formValues.city}, {formValues.state}, {formValues.postalCode}</p>
                                 <p>{formValues.country}</p>
                             </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-xl"><span>Total a Pagar</span><span className="text-primary">{formatPrice(cartTotal)}</span></div>
                         <p className="text-xs text-muted-foreground text-center">El pago se realizará contra-entrega. Revisa tu email para más detalles.</p>
                    </CardContent>
                    <CardFooter>
                         <Button size="lg" type="submit" className="w-full" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Confirmando...</> : 'Confirmar Pedido'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="mt-8 flex justify-between">
                {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrevStep} disabled={dataStep === 'shipping' && !user}><ArrowLeft className="mr-2" /> Anterior</Button>) : (<Button asChild type="button" variant="outline"><Link href="/products">&larr; Seguir Comprando</Link></Button>)}
                {step < 3 && (<Button type="button" onClick={handleNextStep} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Siguiente'}</Button>)}
            </div>
        </form>
      </Form>
    </div>
  );
}
