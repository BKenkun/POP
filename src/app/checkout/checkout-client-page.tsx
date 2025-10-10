"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, Truck, Wallet, Check, CreditCard, Banknote, Smartphone, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, setDocumentNonBlocking, useAuth } from '@/firebase';
import { useForm, useWatch } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { QuantitySelector } from '@/components/quantity-selector';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Order, ShippingAddress } from '@/lib/types';
import { useCheckout } from '@/context/checkout-context';


const checkoutSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().min(3, "El código postal es requerido."),
  country: z.string().min(2, "El país es requerido."),
  paymentMethod: z.enum(['cod_cash', 'cod_card', 'cod_bizum', 'prepaid_bizum', 'prepaid_transfer'], {
    required_error: "Debes seleccionar un método de pago.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type PrimaryPaymentMethod = 'cod' | 'prepaid';

const paymentMethodLabels: { [key in CheckoutFormValues['paymentMethod']]: string } = {
    cod_cash: 'Contra-entrega (Efectivo)',
    cod_card: 'Contra-entrega (Tarjeta)',
    cod_bizum: 'Contra-entrega (Bizum)',
    prepaid_bizum: 'Pago Anticipado (Bizum)',
    prepaid_transfer: 'Pago Anticipado (Transferencia)',
}

const generateOrderCode = (): string => {
  const prefix = "P";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

const getOrderStatus = (paymentMethod: string): string => {
    switch(paymentMethod) {
        case 'prepaid_bizum':
        case 'prepaid_transfer':
            return 'Pago Pendiente de Verificación';
        case 'cod_cash':
        case 'cod_card':
        case 'cod_bizum':
        default:
            return 'Reserva Recibida';
    }
}


const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { number: 1, name: 'Carrito' },
        { number: 2, name: 'Datos' },
        { number: 3, name: 'Pago' },
        { number: 4, name: 'Revisión' },
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
                            {currentStep > step.number ? <Check /> : step.number}
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

const PaymentOption = ({
  value,
  icon: Icon,
  title,
  description,
}: {
  value: CheckoutFormValues['paymentMethod'];
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <Label
    htmlFor={value}
    className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
  >
    <Icon className="h-6 w-6 flex-shrink-0 text-primary" />
    <div className="flex-1">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <RadioGroupItem value={value} id={value} />
  </Label>
);


export default function CheckoutClientPage() {
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart } = useCart();
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [primaryPaymentMethod, setPrimaryPaymentMethod] = useState<PrimaryPaymentMethod>('cod');
  const { setCheckoutData } = useCheckout();

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
      paymentMethod: 'cod_cash',
    },
  });

  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    if (cartCount === 0 && !loading) {
       router.push('/');
    }
  }, [cartCount, router, loading]);

  const handleNextStep = async () => {
    let isValid = false;
    if (step === 2) { // Validate shipping details
        isValid = await form.trigger(['name', 'email', 'phone', 'street', 'city', 'state', 'postalCode', 'country']);
    } else if (step === 3) { // Validate payment method
        isValid = await form.trigger('paymentMethod');
    } else { // Step 1
        isValid = true;
    }
    
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
      setStep(prev => prev - 1);
  };
  
  const handlePrimaryPaymentChange = (value: string) => {
    const newPrimaryMethod = value as PrimaryPaymentMethod;
    setPrimaryPaymentMethod(newPrimaryMethod);
    // Set a default sub-option when the main category changes
    if (newPrimaryMethod === 'cod') {
        form.setValue('paymentMethod', 'cod_card');
    } else {
        form.setValue('paymentMethod', 'prepaid_bizum');
    }
  }


  const onSubmit = async (data: CheckoutFormValues) => {
    if (!firestore) {
        toast({ title: 'Error', description: 'La base de datos no está disponible.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    toast({
        title: 'Procesando tu reserva...',
        description: 'Por favor, espera un momento.',
    });

    try {
        const orderId = generateOrderCode();
        
        const shippingAddress: ShippingAddress = {
            line1: data.street,
            line2: null,
            city: data.city,
            state: data.state,
            postal_code: data.postalCode,
            country: data.country,
        }

        const newOrder: Omit<Order, 'createdAt'> & { createdAt: any } = {
            id: orderId,
            userId: user?.uid || 'guest',
            status: getOrderStatus(data.paymentMethod),
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
            paymentMethod: data.paymentMethod,
            createdAt: serverTimestamp(),
        };

        // If the user is logged in, ensure their user document exists.
        if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            // This is a "set" with "merge", which acts as an "upsert".
            // It will create the document if it doesn't exist with basic info,
            // or do nothing if it already exists. It won't overwrite existing data.
            await setDoc(userDocRef, { email: user.email, uid: user.uid }, { merge: true });
        }
        
        const collectionPath = user ? `users/${user.uid}/orders` : 'reservations';
        const docRef = doc(firestore, collectionPath, orderId);
        
        await setDoc(docRef, newOrder);
        
        // --- Optimistic UI Update ---
        // Set data for the success page
        setCheckoutData({ orderId, paymentMethod: data.paymentMethod });
        
        // Clear the cart and redirect immediately.
        clearCart();
        
        // Redirect to the success page without query params
        router.push('/checkout/success');

    } catch (error: any) {
        console.error("Reservation Error: ", error);
        toast({
            title: 'Error en la Reserva',
            description: error.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.',
            variant: 'destructive',
        });
        setLoading(false); // Only set loading to false on error
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
      <h1 className="text-3xl md:text-4xl font-headline text-primary mb-8 text-center font-bold">Finalizar Reserva</h1>
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
                    <CardHeader><CardTitle>2. Tus Datos de Entrega</CardTitle></CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel><User className="inline-block mr-2"/>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel><Mail className="inline-block mr-2"/>Email de Contacto</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
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
                    </CardContent>
                </Card>
            )}
            
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>3. Método de Pago</CardTitle>
                        <CardDescription>Elige cómo quieres pagar tu pedido.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RadioGroup 
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            value={primaryPaymentMethod}
                            onValueChange={handlePrimaryPaymentChange}
                        >
                            <Label className={cn("flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all", primaryPaymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-muted')}>
                                <RadioGroupItem value="cod" id="cod" className="sr-only" />
                                <Truck className="h-8 w-8 mb-2" />
                                <span className="font-bold text-lg">Pago Contra-entrega</span>
                            </Label>
                            <Label className={cn("flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all", primaryPaymentMethod === 'prepaid' ? 'border-primary bg-primary/5' : 'border-muted')}>
                                <RadioGroupItem value="prepaid" id="prepaid" className="sr-only" />
                                <Wallet className="h-8 w-8 mb-2" />
                                <span className="font-bold text-lg">Pago Anticipado</span>
                            </Label>
                        </RadioGroup>
                        
                        <Separator />

                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                                            <Collapsible open={primaryPaymentMethod === 'cod'}>
                                                <CollapsibleContent className="space-y-4">
                                                     <PaymentOption value="cod_card" icon={CreditCard} title="Pagar con Tarjeta" description="El repartidor llevará un TPV móvil."/>
                                                     <PaymentOption value="cod_cash" icon={Banknote} title="Pagar en Efectivo" description="Ten preparado el importe exacto para el repartidor."/>
                                                     <PaymentOption value="cod_bizum" icon={Smartphone} title="Pagar con Bizum en la entrega" description="Paga con Bizum cuando recibas el paquete."/>
                                                </CollapsibleContent>
                                            </Collapsible>
                                            <Collapsible open={primaryPaymentMethod === 'prepaid'}>
                                                <CollapsibleContent className="space-y-4">
                                                     <PaymentOption value="prepaid_bizum" icon={Smartphone} title="Pagar con Bizum (Anticipado)" description="Recibirás un email con nuestro número de teléfono."/>
                                                     <PaymentOption value="prepaid_transfer" icon={Banknote} title="Pagar por Transferencia (Anticipado)" description="Recibirás un email con nuestro número de cuenta (IBAN)."/>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            )}

            {step === 4 && (
                <Card>
                    <CardHeader><CardTitle>4. Revisa y Confirma tu Reserva</CardTitle></CardHeader>
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
                             <h3 className="font-semibold mb-2">Datos de Entrega:</h3>
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
                        <div>
                            <h3 className="font-semibold mb-2">Método de Pago:</h3>
                             <p className="text-sm text-muted-foreground">{paymentMethodLabels[formValues.paymentMethod]}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-xl">
                            <span>Total a Pagar</span>
                            <span className="text-primary">{formatPrice(cartTotal)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button size="lg" type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null }
                            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
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
                 {step < 4 && (
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
