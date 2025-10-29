
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { CheckCircle, Gift, Package, Sparkles, User, Loader2, Truck, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import { createNowPaymentsSubscription } from '@/app/actions/subscription-nowpayments';

const benefits = [
    { icon: Package, text: "5 poppers de tu elección cada mes" },
    { icon: Sparkles, text: "1 accesorio para poppers" },
    { icon: Gift, text: "Un regalo sorpresa en cada caja" },
    { icon: Truck, text: "Envío gratuito incluido"},
    { icon: CheckCircle, text: "Cancela cuando quieras, sin compromiso" },
];

export default function SubscriptionPage() {
    const { user, loading: authLoading, isSubscribed } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            toast({
                title: "Necesitas iniciar sesión",
                description: "Por favor, inicia sesión para unirte al club.",
                variant: "destructive"
            });
            router.push('/login?redirect=/subscription');
            return;
        }

        setLoading(true);

        try {
            const result = await createNowPaymentsSubscription(user.email!);
            
            if (result.success && result.invoice_url) {
                toast({
                    title: "Redirigiendo a la pasarela de pago...",
                    description: "Completa el pago para activar tu suscripción."
                });
                window.location.href = result.invoice_url;
            } else {
                throw new Error(result.error || "No se pudo iniciar el proceso de suscripción.");
            }

        } catch (error: any) {
            console.error("Subscription Error:", error);
            toast({
                title: "Error al suscribirse",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // If the user is already subscribed, redirect them to their management page.
    if (isSubscribed) {
        router.replace('/account/subscription');
        return (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4">Ya eres miembro. Redirigiendo a tu panel...</p>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Únete al Club: Tu Dosis Mensual</h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                   Recibe una caja personalizada con tus poppers favoritos, un accesorio y regalos sorpresa cada mes.
                </p>
            </div>

            <Card className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="relative h-64 md:h-auto">
                    <Image src="https://picsum.photos/seed/sub/600/800" alt="Caja de suscripción mensual" fill className="object-cover" data-ai-hint="subscription box"/>
                </div>
                <div className="flex flex-col p-8">
                     <CardHeader>
                        <CardTitle className="text-3xl font-bold">¿Qué incluye la caja?</CardTitle>
                        <CardDescription>Todo lo que necesitas para una experiencia superior, entregado en tu puerta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <ul className="space-y-3">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <benefit.icon className="h-6 w-6 text-primary" />
                                    <span className="font-medium text-foreground">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary">44€/mes</p>
                        <p className="text-sm text-muted-foreground">IVA y envío incluidos</p>
                    </div>
                </div>
            </Card>
            
            <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">¿Listo para unirte?</h2>
                 <p className="text-muted-foreground max-w-lg mx-auto">Haz clic para empezar a disfrutar de todas las ventajas del club. Serás redirigido a nuestra pasarela de pago segura para completar la suscripción.</p>
                {user ? (
                     <Button size="lg" onClick={handleSubscribe} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2"/>}
                        {loading ? "Procesando..." : "Sí, quiero unirme al Club"}
                    </Button>
                ) : (
                    <Button size="lg" asChild>
                        <Link href="/login?redirect=/subscription">
                            <User className="mr-2" /> Inicia sesión para unirte
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
