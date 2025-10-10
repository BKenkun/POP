
'use client';

import { Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, MessageCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCheckout } from '@/context/checkout-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


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
    }, [checkoutData, clearCheckoutData, router]);

    if (!checkoutData.orderId) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verificando información del pedido...</p>
            </div>
        );
    }
    
    const isPrepaid = checkoutData.paymentMethod?.startsWith('prepaid');
    
    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8">
            <Card className="w-full max-w-lg">
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
                    <p className="text-muted-foreground">
                        Recibirás un correo electrónico en breve con todos los detalles.
                    </p>
                    
                    {isPrepaid && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>¡Acción Requerida!</AlertTitle>
                            <AlertDescription>
                                Has elegido un método de pago anticipado. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para encontrar las instrucciones y completar el pago.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isPrepaid && (
                         <p className="font-semibold text-destructive-foreground bg-destructive p-3 rounded-md">
                            ¡Importante! Revisa tu bandeja de entrada (y la carpeta de spam) para confirmar todos los detalles de tu reserva.
                        </p>
                    )}
                    
                     <div className="text-sm text-muted-foreground border-t pt-4">
                        <p className="flex items-center justify-center gap-2">
                           <MessageCircle className="h-4 w-4"/> Para cualquier duda, contáctanos por WhatsApp en el 622 222 222.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild>
                            <Link href="/products">
                                <ShoppingBag className="mr-2" />
                                Seguir Comprando
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                <Home className="mr-2" />
                                Volver a la página principal
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CheckoutSuccessPage() {
    // This page is a container for the Suspense boundary,
    // ensuring that the main page can be statically rendered,
    // while the component that uses searchParams is loaded on the client.
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
