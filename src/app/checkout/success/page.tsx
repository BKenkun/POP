
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useEffect } from 'react';

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary">¡Gracias por tu compra!</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Tu pedido ha sido procesado con éxito.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Hemos recibido tu pedido y lo estamos preparando para el envío. Recibirás un correo electrónico de confirmación en breve con los detalles de tu compra y el seguimiento.
                    </p>
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
