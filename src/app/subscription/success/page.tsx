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

/**
 * Pantalla de éxito tras el pago de suscripción.
 * Incluye un listener en tiempo real para detectar cuándo el Webhook activa la cuenta.
 */
export default function SubscriptionSuccessPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [verifying, setVerifying] = useState(true);
    const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

    // Escuchamos el documento del usuario para detectar cuando el Webhook lo activa en Firestore
    useEffect(() => {
        if (!user) return;

        console.log("[SUCCESS PAGE] Esperando activación de suscripción...");
        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // En cuanto el flag sea true, dejamos de mostrar el cargador
                if (data.isSubscribed === true) {
                    console.log("[SUCCESS PAGE] ¡Suscripción activada en Firestore!");
                    setVerifying(false);
                    setIsAlreadySubscribed(true);
                }
            }
        });

        // Timeout de seguridad por si el webhook falla o tarda demasiado (20 segundos)
        const timer = setTimeout(() => {
            setVerifying(false);
        }, 20000);

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
                        {user?.email?.split('@')[0] || 'Miembro'}, tu suscripción ha sido confirmada.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                    <p className="text-muted-foreground text-base">
                        {isAlreadySubscribed 
                            ? "Tu perfil ha sido actualizado con éxito. ¡Ya puedes entrar a elegir tus aromas!" 
                            : "Estamos terminando de sincronizar tu cuenta con el servidor de pagos. Un momento..."}
                    </p>

                    <div className="flex flex-col gap-4 pt-2">
                        {verifying && !isAlreadySubscribed ? (
                            <div className="flex flex-col items-center gap-3 p-6 bg-muted/50 rounded-lg border border-dashed animate-in fade-in">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-sm font-medium text-primary">Actualizando tu acceso en tiempo real...</span>
                            </div>
                        ) : (
                            <Button asChild size="lg" className="w-full text-lg h-14 shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground">
                                <Link href="/account/subscription">
                                    <Package className="mr-2 h-6 w-6" />
                                    Personalizar mi Caja Ahora
                                </Link>
                            </Button>
                        )}
                        
                        <Button asChild variant="ghost" size="lg" className="w-full">
                             <Link href="/account">
                                <User className="mr-2 h-5 w-5" />
                                Ir a mi Panel de Control
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <p className="text-xs text-muted-foreground">
                Hemos enviado un correo de confirmación con el recibo de tu pago.
            </p>
        </div>
    );
}
