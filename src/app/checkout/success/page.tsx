
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Loader2, CheckCircle, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

function SuccessPageContent() {
    const router = useRouter();
    const { clearCart } = useCart();
    const { user } = useAuth();
    
    // As the checkout is now manual, we don't need to verify a session.
    // We just show a success message and clear the cart.
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary font-bold">¡Reserva Confirmada!</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Gracias por tu compra, {user?.email?.split('@')[0] || 'cliente'}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Hemos recibido tu reserva correctamente. Recibirás un email con los detalles y los siguientes pasos para el pago.
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
