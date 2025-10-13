
'use client';

import { Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, Gift, UserPlus, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCheckout } from '@/context/checkout-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { OrderItem } from '@/lib/types';


const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

function SuccessContent() {
    const { checkoutData, clearCheckoutData } = useCheckout();
    const router = useRouter();

    useEffect(() => {
        // If there's no checkout data, the user might have refreshed the page
        // or landed here directly. Redirect them to the homepage.
        if (!checkoutData.orderId) {
            router.replace('/');
        }

        // Clear the checkout data after displaying it once.
        // This is in a cleanup function to run when the component unmounts.
        return () => {
            clearCheckoutData();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!checkoutData.orderId || !checkoutData.orderSummary) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verificando información del pedido...</p>
            </div>
        );
    }
    
    const isPrepaid = checkoutData.paymentMethod?.startsWith('prepaid');
    const order = checkoutData.orderSummary;
    
    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8">
            <Card className="w-full max-w-2xl">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary font-bold">¡Reserva Confirmada!</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Hemos recibido tu reserva con el ID: <span className="font-bold text-primary">#{checkoutData.orderId.substring(checkoutData.orderId.length - 7)}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 [&>svg]:text-blue-600">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-bold">¡Importante!</AlertTitle>
                        <AlertDescription>
                           Guarda una captura de pantalla de esta página para tu referencia. Te hemos enviado un email con todos los detalles (recuerda revisar la carpeta de spam).
                        </AlertDescription>
                    </Alert>
                    
                    {isPrepaid && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>¡Acción Requerida!</AlertTitle>
                            <AlertDescription>
                                Has elegido un método de pago anticipado. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para encontrar las instrucciones y completar el pago.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {/* Order Summary */}
                    <div className="text-left space-y-4 pt-4">
                        <h3 className="font-semibold text-lg text-center">Resumen de tu Pedido</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                             {order.items.map((item: OrderItem) => (
                                <div key={item.productId} className="flex items-center gap-4">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                                        <Image src={getImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                                    </div>
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>TOTAL</span>
                            <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                    </div>

                    <Separator />
                    
                    {order.userId === 'guest' && (
                        <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2"><Gift className="h-5 w-5 text-primary"/>¡Consigue Ventajas Exclusivas!</CardTitle>
                                <CardDescription>Crea una cuenta para disfrutar de puntos de fidelidad, ofertas especiales y un historial de compras.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild size="lg">
                                    <Link href="/register">
                                        <UserPlus className="mr-2"/>
                                        Crear mi Cuenta Ahora
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}


                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Button asChild>
                            <Link href="/products">
                                <ShoppingBag className="mr-2" />
                                Seguir Comprando
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                <Home className="mr-2" />
                                Volver al Inicio
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
