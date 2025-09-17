
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { CheckCircle, Gift, Package, Sparkles, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSubscriptionCheckoutAction } from '../actions/checkout';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const benefits = [
    { icon: Package, text: "4 poppers de tu elección cada mes" },
    { icon: Sparkles, text: "Precio por unidad insuperable (solo 8,75€/ud.)" },
    { icon: Gift, text: "Un regalo sorpresa en cada caja" },
    { icon: CheckCircle, text: "Cancela cuando quieras, sin compromiso" },
];

export default function SubscriptionPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubscription = async () => {
        if (!user) {
            router.push('/login?redirect=/subscription');
            return;
        }

        setLoading(true);
        toast({
            title: 'Creando tu suscripción...',
            description: 'Espera mientras te redirigimos al pago seguro.',
        });

        try {
            const { sessionUrl, error } = await createSubscriptionCheckoutAction(user.uid, user.email || '');

            if (error || !sessionUrl) {
                throw new Error(error || 'No se pudo iniciar el proceso de suscripción.');
            }

            window.location.href = sessionUrl;

        } catch (error: any) {
            toast({
                title: 'Error de Suscripción',
                description: error.message,
                variant: 'destructive'
            });
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Club Dosis Mensual</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Recibe tus poppers favoritos en casa cada mes, ahorrando dinero y sin preocupaciones. ¡La forma más inteligente de disfrutar!
                </p>
            </div>

            <Card className="bg-primary/5 border-primary/20 shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Tu Caja Mensual</CardTitle>
                    <p className="text-muted-foreground">Valorada en más de 55€</p>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">¿Qué incluye el club?</h3>
                        <ul className="space-y-3">
                            {benefits.map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <item.icon className="h-6 w-6 text-primary flex-shrink-0" />
                                    <span className="text-foreground/90">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card p-8 rounded-lg text-center shadow-lg space-y-4">
                        <p className="text-5xl font-bold text-primary">35€</p>
                        <p className="font-semibold text-muted-foreground">/ mes</p>
                        <Button
                            size="lg"
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={handleSubscription}
                            disabled={authLoading || loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <User className="mr-2 h-5 w-5" />
                            )}
                            {loading ? 'Procesando...' : (user ? 'Unirme al Club Ahora' : 'Inicia Sesión para Unirte')}
                        </Button>
                         <p className="text-xs text-muted-foreground">Serás redirigido a Stripe para un pago seguro.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-12 text-center text-muted-foreground space-y-4">
                <h3 className="text-xl font-semibold text-foreground">¿Cómo funciona?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <p className="font-bold text-primary text-4xl">1</p>
                        <h4 className="font-semibold">Suscríbete</h4>
                        <p className="text-sm">Únete al club con un solo clic. El pago es 100% seguro con Stripe.</p>
                    </div>
                     <div className="space-y-2">
                        <p className="font-bold text-primary text-4xl">2</p>
                        <h4 className="font-semibold">Elige tus Poppers</h4>
                        <p className="text-sm">Cada mes, desde tu panel de usuario, podrás elegir los 4 poppers para tu próxima caja.</p>
                    </div>
                     <div className="space-y-2">
                        <p className="font-bold text-primary text-4xl">3</p>
                        <h4 className="font-semibold">Disfruta y Ahorra</h4>
                        <p className="text-sm">Recibe tu pedido discretamente en casa y disfruta del mejor precio garantizado.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
