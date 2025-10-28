'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { AlertTriangle, Home, Phone } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function SubscriptionFailedPage() {
    const { user } = useAuth();

    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg border-destructive">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-destructive font-bold">Pago Fallido</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        Lo sentimos, {user?.email?.split('@')[0] || 'usuario'}, no hemos podido procesar tu suscripción.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                       El pago no se pudo completar. Por favor, vuelve a intentarlo o prueba con otro método de pago. Si el problema persiste, no dudes en contactar con nosotros.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                        <Button asChild size="lg" variant="default">
                            <Link href="/subscription">
                                Reintentar Suscripción
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                             <Link href="/contacto">
                                <Phone className="mr-2" />
                                Contactar Soporte
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
