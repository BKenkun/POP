'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { CheckCircle, Package, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function SubscriptionSuccessPage() {
    const { user, isSubscribed } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);

    // Escuchamos el documento del usuario para detectar cuando el Webhook lo activa
    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.isSubscribed === true) {
                    setVerifying(false);
                }
            }
        });

        // Timeout de seguridad por si el webhook falla o tarda demasiado
        const timer = setTimeout(() => setVerifying(false), 10000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [user]);

    return (
         <div className="flex flex-col items-center justify-center text-center space-y-8 py-12 max-w-lg mx-auto px-4">
            <Card className="w-full border-primary/20 shadow-xl overflow-hidden">
                <div className="h-2 bg-primary animate-pulse" />
                <CardHeader className="items-center space-y-4 pt-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 relative">
                        <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
                        <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-bounce" />
                    </div>
                    <CardTitle className="text-3xl font-headline text-primary font-bold">
                        ¡Ya eres del Club!
                    </CardTitle>
                    <CardDescription className="text-lg text-foreground/80">
                        {user?.email?.split('@')[0] || 'Nuevo Miembro'}, tu suscripción ha sido confirmada.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                    <p className="text-muted-foreground text-base">
                        Estamos sincronizando tu perfil. En unos segundos podrás elegir los productos de tu primera caja mensual.
                    </p>

                    <div className="flex flex-col gap-4 pt-2">
                        {verifying ? (
                            <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-sm font-medium animate-pulse">Sincronizando suscripción...</span>
                            </div>
                        ) : (
                            <Button asChild size="lg" className="w-full text-lg h-14 shadow-lg hover:scale-105 transition-transform">
                                <Link href="/account/subscription">
                                    <Package className="mr-2 h-6 w-6" />
                                    Personalizar mi Caja Ahora
                                </Link>
                            </Button>
                        )}
                        
                        <Button asChild variant="ghost" size="lg" className="w-full">
                             <Link href="/account">
                                <User className="mr-2 h-5 w-5" />
                                Ir a mi Panel de Usuario
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <p className="text-xs text-muted-foreground">
                Recibirás un correo electrónico de confirmación con los detalles de tu suscripción y el recibo de pago.
            </p>
        </div>
    );
}