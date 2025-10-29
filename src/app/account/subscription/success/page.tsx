
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle, Package, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function SubscriptionSuccessPage() {
    const { user } = useAuth();

    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary font-bold">¡Suscripción Confirmada!</CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        ¡Felicidades, {user?.email?.split('@')[0] || 'nuevo miembro'}! Ya eres parte del Club Dosis Mensual.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        Hemos recibido tu primer pago correctamente. Tu primera caja se está preparando y pronto podrás personalizarla.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                        <Button asChild size="lg">
                            <Link href="/account/subscription">
                                <Package className="mr-2" />
                                Personalizar mi Caja
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
