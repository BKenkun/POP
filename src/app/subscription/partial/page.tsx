'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { AlertTriangle, Home, Phone } from 'lucide-react';

export default function SubscriptionPartialPaymentPage() {
    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg border-amber-500">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                        <AlertTriangle className="h-10 w-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-amber-600 font-bold">Pago Parcial Detectado</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                       Hemos recibido solo una parte del pago total.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      Tu suscripción no se activará hasta que se complete el pago total. Por favor, contacta con nuestro equipo de soporte para resolver esta incidencia y completar el pago restante.
                    </p>
                    <div className="flex justify-center pt-2">
                        <Button asChild size="lg" variant="default">
                             <Link href="/contacto">
                                <Phone className="mr-2" />
                                Contactar con Soporte
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
