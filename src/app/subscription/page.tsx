
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { CheckCircle, Gift, Package, Sparkles, User, Loader2, Truck, Settings, CalendarClock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSubscriptionCheckoutAction } from '../actions/checkout';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';

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

    const handleSubscription = async () => {
        if (isSubscribed) {
            router.push('/account/subscription');
            return;
        }
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
    
    const ctaText = isSubscribed ? 'Gestionar Mi Dosis' : (user ? 'Unirme al Club Ahora' : 'Inicia Sesión para Unirte');
    const finalCtaText = isSubscribed ? 'Ir a mi Panel' : (user ? 'Unirme por 40€/mes' : 'Inicia Sesión para Unirte');


    return (
        <div className="space-y-16">
            {/* Sección 1: Título Principal (Hero) */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Club Dosis Mensual</h1>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                    Accede a nuestro club exclusivo y recibe tus poppers favoritos en casa cada mes, ahorrando dinero y sin preocupaciones. ¡La forma más inteligente de disfrutar!
                </p>
            </div>

            {/* Sección 2: Tarjeta de Oferta Principal */}
            <Card className="max-w-4xl mx-auto overflow-hidden shadow-xl border-2 border-primary">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 order-2 md:order-1 flex flex-col justify-center">
                        <CardHeader className="p-0 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="h-8 w-8 text-primary" />
                                <h2 className="text-3xl font-headline font-bold text-primary">Tu Plan de Placer Mensual</h2>
                            </div>
                            <CardDescription className="text-base">
                                Una experiencia completa, entregada discretamente en tu puerta cada mes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-primary">40€</span>
                                <span className="text-lg text-muted-foreground">/mes</span>
                            </div>
                            <p className="text-muted-foreground font-medium mb-6">
                                Ahorra más de un 35%. Cancela cuando quieras, sin compromiso.
                            </p>
                            <Button size="lg" className="w-full font-bold bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSubscription} disabled={authLoading || loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <User className="mr-2 h-5 w-5" />
                                )}
                                {loading ? 'Procesando...' : ctaText}
                            </Button>
                        </CardContent>
                    </div>
                    <div className="relative h-80 md:h-full order-1 md:order-2">
                        <Image
                            src="https://picsum.photos/seed/poppersclub/800/1000"
                            alt="Varios botes de popper para la caja de suscripción mensual"
                            fill
                            className="object-cover"
                            data-ai-hint="popper bottles"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/70 md:via-background/50 to-transparent" />
                    </div>
                </div>
            </Card>

             {/* Sección 3: ¿Cómo Funciona el Club? */}
            <div className="text-center">
                 <h2 className="text-3xl md:text-4xl font-headline text-primary font-bold mb-4">¿Cómo Funciona el Club?</h2>
                 <p className="text-lg text-foreground/80 max-w-3xl mx-auto mb-12">
                    Unirse es fácil y rápido. En solo tres pasos estarás disfrutando de tus beneficios exclusivos.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20">
                           <User className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">1. Suscríbete</h3>
                        <p className="text-muted-foreground">Únete al club con un pago seguro a través de Stripe. Es rápido y 100% fiable.</p>
                    </div>
                     <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20">
                           <Settings className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">2. Personaliza tu Caja</h3>
                         <p className="text-muted-foreground">Desde tu panel de usuario, elige los poppers y el accesorio que quieres recibir cada mes.</p>
                    </div>
                     <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20">
                            <Gift className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">3. Disfruta y Ahorra</h3>
                        <p className="text-muted-foreground">Recibe tu caja discretamente en casa y disfruta del mejor precio garantizado.</p>
                    </div>
                </div>
            </div>
            
            {/* Sección 6: Contenido de la Dosis Mensual */}
            <div className="text-center">
                 <h2 className="text-3xl md:text-4xl font-headline text-primary font-bold mb-12">Tu Dosis Mensual Incluye</h2>
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                             <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Package className="h-10 w-10 text-primary"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2 text-center md:text-left">5 Poppers a tu Elección</h3>
                                <p className="text-muted-foreground text-center md:text-left">Explora nuestro catálogo y elige tus 5 aromas favoritos cada mes. ¡Ideal para descubrir novedades o asegurar tus clásicos!</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                             <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-10 w-10 text-primary"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2 text-center md:text-left">1 Accesorio Práctico</h3>
                                <p className="text-muted-foreground text-center md:text-left">Recibe un accesorio útil para mejorar tu experiencia, como inhaladores, limpiadores o tapones especiales.</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                             <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Gift className="h-10 w-10 text-primary"/>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary mb-2 text-center md:text-left">1 Regalo Sorpresa</h3>
                                <p className="text-muted-foreground text-center md:text-left">Nos encanta sorprenderte. Cada mes incluiremos un pequeño detalle extra solo para los miembros del club.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Sección 7: Llamada a la Acción Final (CTA) */}
            <div className="text-center">
                <Button size="lg" className="font-bold text-lg h-14 px-10 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSubscription} disabled={authLoading || loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                       <ArrowRight className="mr-2 h-6 w-6" />
                    )}
                    {loading ? 'Procesando...' : finalCtaText}
                </Button>
            </div>

        </div>
    );
}
