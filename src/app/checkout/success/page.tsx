
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const paymentMethod = searchParams.get('paymentMethod');

    const isPrepaid = paymentMethod?.startsWith('prepaid');

    const getPrepaidMessage = () => {
        if (paymentMethod === 'prepaid_bizum') {
            return "Hemos recibido tu reserva. En breve recibirás un correo electrónico con nuestro número de Bizum para realizar el pago.";
        }
        if (paymentMethod === 'prepaid_transfer') {
             return "Hemos recibido tu reserva. En breve recibirás un correo electrónico con nuestro IBAN para realizar la transferencia.";
        }
        return "Hemos recibido tu reserva. En breve recibirás un correo electrónico con las instrucciones de pago.";
    }

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary font-bold">¡Reserva Confirmada!</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Hemos recibido tu reserva correctamente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Recibirás un correo electrónico en breve con todos los detalles de tu pedido y las instrucciones de pago si has elegido un método por adelantado.
                    </p>
                    <p className="font-semibold text-destructive-foreground bg-destructive p-3 rounded-md">
                        ¡Importante! Revisa tu bandeja de entrada (y la carpeta de spam) para confirmar todos los detalles.
                    </p>
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
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
