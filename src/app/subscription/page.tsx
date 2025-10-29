
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { CheckCircle, Gift, Package, Sparkles, User, Loader2, Truck, Settings, UserPlus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createNowPaymentsSubscription } from '@/app/actions/subscription-nowpayments';
import Link from 'next/link';

const benefits = [
    { icon: Package, title: "5 Poppers a tu Elección", description: "Explora nuestro catálogo y elige tus 5 aromas favoritos cada mes. ¡Ideal para descubrir novedades o asegurar tus clásicos!" },
    { icon: Sparkles, title: "1 Accesorio Práctico", description: "Recibe un accesorio útil para mejorar tu experiencia, como inhaladores, limpiadores o tapones especiales." },
    { icon: Gift, title: "1 Regalo Sorpresa", description: "Nos encanta sorprenderte. Cada mes incluiremos un pequeño detalle extra solo para los miembros del club." },
];

const howItWorks = [
    { icon: UserPlus, title: "1. Suscríbete", description: "Únete al club con un pago seguro con tarjeta o criptomonedas. Es rápido y 100% fiable." },
    { icon: Settings, title: "2. Personaliza tu Caja", description: "Desde tu panel de usuario, elige los poppers y el accesorio que quieres recibir cada mes." },
    { icon: ShoppingBag, title: "3. Disfruta y Ahorra", description: "Recibe tu caja discretamente en casa y disfruta del mejor precio garantizado." },
]

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

        if (!user.email) {
            toast({
                title: "Email no encontrado",
                description: "Tu cuenta de usuario debe tener un email para poder suscribirte.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const result = await createNowPaymentsSubscription(user.email);
            
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
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Club Dosis Mensual</h1>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                   Accede a nuestro club exclusivo y recibe tus poppers favoritos en casa cada mes, ahorrando dinero y sin preocupaciones. ¡La forma más inteligente de disfrutar!
                </p>
            </div>

            <Card className="grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-lg border-primary/20">
                <div className="flex flex-col p-8 justify-center">
                     <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-3xl font-bold flex items-center gap-2">
                           <Sparkles className="h-8 w-8 text-primary" />
                           Tu Plan de Placer Mensual
                        </CardTitle>
                        <CardDescription>Una experiencia completa, entregada discretamente en tu puerta cada mes.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                         <div>
                            <p className="text-5xl font-bold text-primary">44€<span className="text-2xl text-muted-foreground">/mes</span></p>
                            <p className="text-sm text-muted-foreground mt-1">Ahorra más de un 35%. Cancela cuando quieras, sin compromiso.</p>
                        </div>
                        <Button size="lg" className="w-full" onClick={handleSubscribe} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                            {loading ? "Procesando..." : "Unirme al Club"}
                        </Button>
                    </CardContent>
                </div>
                <div className="relative h-64 md:h-auto min-h-[300px]">
                    <Image src="https://picsum.photos/seed/sub-main/600/800" alt="Caja de suscripción mensual" fill className="object-cover" data-ai-hint="subscription box"/>
                </div>
            </Card>

            <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-foreground">¿Cómo Funciona el Club?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Unirse es fácil y rápido. En solo tres pasos estarás disfrutando de tus beneficios exclusivos.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    {howItWorks.map((step) => (
                        <div key={step.title} className="flex flex-col items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <step.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">{step.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Tu Dosis Mensual Incluye</h2>
                <div className="space-y-4 max-w-2xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <Card key={index} className="text-left">
                            <CardContent className="p-4 flex items-center gap-4">
                                <benefit.icon className="h-8 w-8 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
            <div className="text-center space-y-4 pt-8">
                 <Button size="lg" className="w-full max-w-xs mx-auto" onClick={handleSubscribe} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                    {loading ? "Procesando..." : "Unirme al Club por 44€/mes"}
                </Button>
            </div>
        </div>
    );
}
