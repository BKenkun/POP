
"use client";

import React from 'react';
import { useCart } from '@/context/cart-context';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin, Truck, Wallet, Check, Circle, Dot, ArrowLeft, CreditCard, Banknote, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
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
import { createReservationAction } from '@/app/actions/create-reservation';
import { Label } from '@/components/ui/label';
import { QuantitySelector } from '@/components/quantity-selector';

const checkoutSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(9, "El teléfono es requerido."),
  street: z.string().min(5, "La calle es requerida."),
  city: z.string().min(2, "La ciudad es requerida."),
  state: z.string().min(2, "El estado/provincia es requerido."),
  postalCode: z.string().min(3, "El código postal es requerido."),
  country: z.string().min(2, "El país es requerido."),
  paymentMethod: z.enum(['cod_cash', 'cod_card', 'prepaid_bizum', 'prepaid_transfer'], {
    required_error: "Debes seleccionar un método de pago.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const paymentMethodLabels: { [key in CheckoutFormValues['paymentMethod']]: string } = {
    cod_cash: 'Contra-entrega (Efectivo)',
    cod_card: 'Contra-entrega (Tarjeta)',
    prepaid_bizum: 'Pago Anticipado (Bizum)',
    prepaid_transfer: 'Pago Anticipado (Transferencia)',
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


export default function CheckoutClientPage() {
  const { cartItems, cartTotal, cartCount, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
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
  

  const onSubmit = async (data: CheckoutFormValues) => {
    setLoading(true);
    toast({
        title: 'Procesando tu reserva...',
        description: 'Por favor, espera un momento.',
    });

    try {
        const { orderId, error } = await createReservationAction({
            customerDetails: data,
            items: cartItems,
            total: cartTotal,
            userId: user?.uid,
        });

        if (error || !orderId) {
            throw new Error(error || 'No se pudo crear la reserva.');
        }
        
        clearCart();
        
        toast({
            title: '¡Reserva Confirmada!',
            description: `Tu número de pedido es ${orderId}. Revisa tu email para más detalles.`,
        });

        router.push(`/checkout/success?orderId=${orderId}&paymentMethod=${data.paymentMethod}`);
        
    } catch (error: any) {
        console.error("Reservation Error: ", error);
        toast({
            title: 'Error en la Reserva',
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
                    <CardHeader><CardTitle>3. Método de Pago</CardTitle></CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <Label className="flex flex-col p-4 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-lg flex items-center gap-2"><Truck /> Contra-entrega (Efectivo)</span>
                                                    <FormControl><RadioGroupItem value="cod_cash" /></FormControl>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">Paga en efectivo al repartidor en el momento de la entrega.</p>
                                            </Label>
                                        </Card>
                                         <Card>
                                            <Label className="flex flex-col p-4 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-lg flex items-center gap-2"><CreditCard /> Contra-entrega (Tarjeta)</span>
                                                    <FormControl><RadioGroupItem value="cod_card" /></FormControl>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">Paga con tarjeta a través del TPV móvil del repartidor.</p>
                                            </Label>
                                        </Card>
                                         <Card>
                                            <Label className="flex flex-col p-4 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-lg flex items-center gap-2"><Smartphone /> Pago Anticipado (Bizum)</span>
                                                    <FormControl><RadioGroupItem value="prepaid_bizum" /></FormControl>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">Recibirás un email con el número para realizar el pago.</p>
                                            </Label>
                                        </Card>
                                         <Card>
                                            <Label className="flex flex-col p-4 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-lg flex items-center gap-2"><Banknote /> Pago Anticipado (Transferencia)</span>
                                                    <FormControl><RadioGroupItem value="prepaid_transfer" /></FormControl>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">Recibirás un email con el IBAN para realizar el pago.</p>
                                            </Label>
                                        </Card>
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
