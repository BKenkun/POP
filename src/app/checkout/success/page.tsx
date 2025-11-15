
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Loader2, CheckCircle, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

function SuccessPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCart();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            router.replace('/checkout');
            return;
        }

        const verifySession = async () => {
            try {
                const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'No se pudo verificar el pago.');
                }
                
                // If verification is successful, the server-side API route has already created the order.
                // We just need to clear the cart.
                clearCart();
                setIsLoading(false);

            } catch (err: any) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        verifySession();
    }, [sessionId, router, clearCart]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verificando tu pago, por favor espera...</p>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
                 <Card className="w-full max-w-lg border-destructive">
                     <CardHeader className="items-center space-y-4">
                        <CardTitle className="text-3xl font-headline text-destructive font-bold">Error en el Pago</CardTitle>
                        <CardDescription className="text-lg text-foreground/80">
                           No hemos podido confirmar tu pago.
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <p className="text-muted-foreground">{error}</p>
                         <Button asChild variant="outline">
                            <Link href="/checkout">Volver al Checkout</Link>
                        </Button>
                     </CardContent>
                 </Card>
            </div>
        );
    }

    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary font-bold">¡Pago Completado!</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Gracias por tu compra, {user?.email?.split('@')[0] || 'cliente'}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Hemos recibido tu pago correctamente y tu pedido está siendo procesado. Recibirás un email de confirmación en breve.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                        <Button asChild size="lg">
                            <Link href="/account/orders">
                                <ShoppingBag className="mr-2" />
                                Ver Mis Pedidos
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                             <Link href="/account">
                                <User className="mr-2" />
                                Ir a mi Cuenta
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
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <SuccessPageContent />
        </Suspense>
    )
}
