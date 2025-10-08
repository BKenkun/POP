
"use client";

import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Loader2, Home, User, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createReservationAction } from '@/app/actions/create-reservation';

const checkoutSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(9, "El teléfono es requerido."),
  address: z.string().min(10, "La dirección de entrega es requerida."),
  postalCode: z.string().min(3, "El código postal es requerido."),
  paymentMethod: z.enum(['cod', 'prepaid'], {
    required_error: "Debes seleccionar un método de pago.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutClientPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      address: '',
      postalCode: '',
      paymentMethod: 'cod',
    },
  });
  
  useEffect(() => {
    if (cartCount === 0 && !loading) {
       router.push('/');
    }
  }, [cartCount, router, loading]);

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
        });

        if (error || !orderId) {
            throw new Error(error || 'No se pudo crear la reserva.');
        }
        
        clearCart();
        
        toast({
            title: '¡Reserva Confirmada!',
            description: `Tu número de pedido es ${orderId}. Revisa tu email para más detalles.`,
        });

        // Redirect to a success page with order details
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Columna Izquierda: Formulario de Datos */}
            <div>
                <h2 className="text-2xl font-headline mb-4 font-bold">1. Tus Datos de Entrega</h2>
                <Card>
                    <CardContent className="p-6 space-y-4">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel><User className="inline-block mr-2"/>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel><Mail className="inline-block mr-2"/>Email de Contacto</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel><Phone className="inline-block mr-2"/>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel><Home className="inline-block mr-2"/>Dirección de Entrega</FormLabel><FormControl><Input placeholder="Calle, número, piso..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem><FormLabel><MapPin className="inline-block mr-2"/>Código Postal</FormLabel><FormControl><Input placeholder="03203" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <h2 className="text-2xl font-headline mt-8 mb-4 font-bold">2. Método de Pago</h2>
                 <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <Card className="flex-1">
                                    <Label className="flex flex-col p-4 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">Pago Contra-entrega</span>
                                            <FormControl>
                                                <RadioGroupItem value="cod" />
                                            </FormControl>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">Paga al repartidor en el momento de la entrega. Aceptamos efectivo o tarjeta (TPV móvil).</p>
                                    </Label>
                                </Card>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <Card className="flex-1">
                                    <Label className="flex flex-col p-4 cursor-pointer">
                                         <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">Pago Anticipado (Bizum / Transferencia)</span>
                                             <FormControl>
                                                <RadioGroupItem value="prepaid" />
                                            </FormControl>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">Paga después de confirmar tu reserva para agilizar el envío. Recibirás las instrucciones por email.</p>
                                    </Label>
                                </Card>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            
            {/* Columna Derecha: Resumen de Pedido */}
            <div>
            <h2 className="text-2xl font-headline mb-4 font-bold">3. Resumen de tu Reserva</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Productos en tu carrito</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total a Pagar</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4">
                <Button size="lg" type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null }
                    {loading ? 'Confirmando...' : `Confirmar Reserva (${formatPrice(cartTotal)})`}
                </Button>
                <div className="text-center mt-2">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                    &larr; Volver a la tienda
                    </Link>
                </div>
                </CardFooter>
            </Card>
            </div>
        </form>
      </Form>
    </div>
  );
}
