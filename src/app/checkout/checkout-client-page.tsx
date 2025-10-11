
"use client";

import React from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
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

// Validation schema updated to include password fields
const checkoutSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().min(3, "El código postal es requerido."),
  country: z.string().min(2, "El país es requerido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Debes confirmar la contraseña."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});


type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const generateOrderCode = (): string => {
  const prefix = "P";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

const getOrderStatus = (): string => {
    // All orders now start as 'Reserva Recibida' since they are associated with an account
    return 'Reserva Recibida';
}


const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { number: 1, name: 'Carrito' },
        { number: 2, name: 'Tus Datos' },
        { number: 3, name: 'Revisión' },
    ];
    return (
        <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
                 <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all",
                            currentStep > step.number ? "bg-primary border-primary text-primary-foreground" : (currentStep === step.number ? "border-primary text-primary" : "border-muted text-muted-foreground bg-muted/50")
                        )}>
                            {currentStep > step.number ? <User /> : step.number}
                        </div>
                        <p className={cn(
                            "mt-2 text-sm font-medium",
                            currentStep >= step.number ? "text-primary" : "text-muted-foreground"
                        )}>{step.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={cn("flex-1 h-1 mx-4 rounded-full transition-all", currentStep > index + 1 ? "bg-primary" : "bg-muted")}></div>
                    )}
                 </React.Fragment>
            ))}
        </div>
    );
};


export default function CheckoutClientPage() {
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart } = useCart();
  const firestore = useFirestore();
  const { auth, user } = useFirebaseAuth(); // Get auth instance and existing user
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(user ? 1 : 1); // Start at step 1 for all
  const { setCheckoutData } = useCheckout();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);


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
      password: '',
      confirmPassword: '',
    },
  });
  
  const formValues = form.watch();


  React.useEffect(() => {
    if (cartCount === 0 && !loading) {
       router.push('/');
    }
  }, [cartCount, router, loading]);
  
   React.useEffect(() => {
    // If a user is already logged in, pre-fill the email and disable password fields.
    if (user) {
      form.setValue('email', user.email || '');
      form.setValue('password', 'dummyPassword'); // Fill with dummy data to pass validation
      form.setValue('confirmPassword', 'dummyPassword');
    }
  }, [user, form]);


  const handleNextStep = async () => {
    let isValid = false;
    if (step === 2) { // Validate all form fields
        isValid = await form.trigger();
    } else { // Step 1 (Cart)
        isValid = true;
    }
    
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
      setStep(prev => prev - 1);
  };
  
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!firestore || !auth) {
        toast({ title: 'Error', description: 'El servicio no está disponible. Inténtalo de nuevo.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    toast({
        title: 'Procesando tu pedido...',
        description: 'Por favor, espera un momento.',
    });

    try {
        let userId = user?.uid;
        let userEmail = user?.email;

        // If the user is a guest, create a new account for them
        if (!user) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                userId = userCredential.user.uid;
                userEmail = userCredential.user.email;
                
                // Create user document in Firestore
                const userDocRef = doc(firestore, "users", userId);
                await setDoc(userDocRef, {
                    uid: userId,
                    email: userEmail,
                    displayName: data.name,
                    createdAt: serverTimestamp(),
                    loyaltyPoints: 0,
                    isSubscribed: false,
                });

                // Auto-login the new user
                 await signInWithEmailAndPassword(auth, data.email, data.password);
                 router.refresh();

            } catch (error: any) {
                 if (error.code === 'auth/email-already-in-use') {
                    throw new Error('Este email ya está registrado. Por favor, inicia sesión para completar tu pedido.');
                }
                throw new Error('No se pudo crear tu cuenta. Revisa los datos.');
            }
        }
        
        if (!userId) {
            throw new Error('No se pudo obtener la identificación del usuario para crear el pedido.');
        }

        const orderId = generateOrderCode();
        
        const shippingAddress: ShippingAddress = {
            line1: data.street,
            line2: null,
            city: data.city,
            state: data.state,
            postal_code: data.postalCode,
            country: data.country,
        }

        // Now that we have a userId, we can create the order in the `orders` collection
        const orderPayload: Omit<Order, 'createdAt' | 'id'> = {
            userId: userId,
            status: getOrderStatus(),
            total: cartTotal,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl
            })),
            customerName: data.name,
            customerEmail: data.email,
            shippingAddress: shippingAddress,
            paymentMethod: 'cod_cash', // Defaulting to one method as payment selection was removed for simplicity
        };
        
        const orderDocRef = doc(firestore, 'orders', orderId);
        await setDoc(orderDocRef, {
            ...orderPayload,
            createdAt: serverTimestamp(),
        });

        const orderSummaryForUI = {
            ...orderPayload,
            id: orderId,
            createdAt: new Date(),
        }
        
        setCheckoutData({
            orderId,
            paymentMethod: 'cod_cash',
            orderSummary: orderSummaryForUI as any,
        });
        
        clearCart();
        router.push('/checkout/success');

    } catch (error: any) {
        console.error("Order Error: ", error);
        toast({
            title: 'Error al realizar el pedido',
            description: error.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.',
            variant: 'destructive',
        });
        setLoading(false);
    }
  };

  if (cartCount === 0 && !loading) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
            <h2 className="mt-4 text-xl font-semibold">Tu carrito está vacío</h2>
            <p className="text-muted-foreground">Te estamos redirigiendo a la tienda...</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center font-bold">Finalizar Pedido</h1>
      <Stepper currentStep={step} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 && (
                <Card>
                    <CardHeader><CardTitle>1. Confirma tu Carrito</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                                    <div className="mt-2">
                                        <QuantitySelector quantity={item.quantity} onQuantityChange={(q) => updateQuantity(item.id, q)} maxStock={item.stock} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>Eliminar</Button>
                                </div>
                            </div>
                        ))}
                         <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

             {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>2. Tus Datos</CardTitle>
                        { !user && <p className="text-muted-foreground">Crea una cuenta para finalizar tu pedido y disfrutar de beneficios.</p> }
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel><User className="inline-block mr-2"/>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel><Mail className="inline-block mr-2"/>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel><Phone className="inline-block mr-2"/>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel><Home className="inline-block mr-2"/>Calle y número</FormLabel><FormControl><Input placeholder="Calle Falsa 123, 4º B" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem><FormLabel>Estado / Provincia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        {!user && (
                            <>
                                <Separator className="md:col-span-2" />
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel><Lock className="inline-block mr-2" />Crear Contraseña</FormLabel>
                                        <FormControl><div className="relative">
                                            <Input type={showPassword ? 'text' : 'password'} {...field} className="pr-10" />
                                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}><EyeOff className={cn(showPassword ? 'block' : 'hidden')} /><Eye className={cn(showPassword ? 'hidden' : 'block')} /></Button>
                                        </div></FormControl>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem><FormLabel>Confirmar Contraseña</FormLabel>
                                        <FormControl><div className="relative">
                                             <Input type={showConfirmPassword ? 'text' : 'password'} {...field} className="pr-10" />
                                             <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><EyeOff className={cn(showConfirmPassword ? 'block' : 'hidden')} /><Eye className={cn(showConfirmPassword ? 'hidden' : 'block')} /></Button>
                                        </div></FormControl>
                                    <FormMessage /></FormItem>
                                )} />
                            </>
                        )}
                    </CardContent>
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
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div>
                             <h3 className="font-semibold mb-2">Tus Datos:</h3>
                             <div className="text-sm text-muted-foreground">
                                 <p>{formValues.name}</p>
                                 <p>{formValues.email}</p>
                                 <p>{formValues.phone}</p>
                                 <p>{formValues.street}</p>
                                 <p>{formValues.city}, {formValues.state}, {formValues.postalCode}</p>
                                 <p>{formValues.country}</p>
                             </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-xl">
                            <span>Total a Pagar</span>
                            <span className="text-primary">{formatPrice(cartTotal)}</span>
                        </div>
                         <p className="text-xs text-muted-foreground text-center">El pago se realizará contra-entrega. Revisa tu email para más detalles.</p>
                    </CardContent>
                    <CardFooter>
                         <Button size="lg" type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null }
                            {loading ? 'Confirmando...' : 'Confirmar Pedido'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="mt-8 flex justify-between">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handlePrevStep}>
                       <ArrowLeft className="mr-2" /> Anterior
                    </Button>
                ) : (
                    <Button asChild type="button" variant="outline">
                        <Link href="/products">&larr; Seguir Comprando</Link>
                    </Button>
                )}
                 {step < 3 && (
                    <Button type="button" onClick={handleNextStep}>
                        Siguiente
                    </Button>
                )}
            </div>

        </form>
      </Form>
    </div>
  );
}
