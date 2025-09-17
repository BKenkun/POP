
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { Loader2, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createStripePortalAction } from "@/app/actions/manage-subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function SubscriptionManagementPage() {
    const { user, isSubscribed, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [portalLoading, setPortalLoading] = useState(false);

    // Show a welcome toast on first subscription
    useEffect(() => {
        if (searchParams.get('subscription_success')) {
            toast({
                title: '¡Bienvenido/a al Club!',
                description: 'Tu suscripción a la Dosis Mensual está activa. ¡Gracias por unirte!',
                duration: 8000
            });
            // Clean the URL
            router.replace('/account/subscription', { scroll: false });
        }
    }, [searchParams, toast, router]);

    // Redirect if not subscribed or not logged in
    useEffect(() => {
        if (!authLoading && (!user || !isSubscribed)) {
            router.push('/');
        }
    }, [user, isSubscribed, authLoading, router]);

    const handleManageSubscription = async () => {
        if (!user) return;

        setPortalLoading(true);
        toast({ title: 'Redirigiendo a tu portal de cliente...' });
        
        const { url, error } = await createStripePortalAction(user.uid);

        if (error || !url) {
            toast({ title: 'Error', description: error || 'No se pudo abrir el portal.', variant: 'destructive' });
            setPortalLoading(false);
            return;
        }

        window.location.href = url;
    };
    
    if (authLoading || !isSubscribed) {
        return (
            <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold">Mi Dosis Mensual</h2>
                <p className="text-muted-foreground">
                    Gestiona tu suscripción, elige tus productos y revisa el ciclo de envío.
                </p>
            </div>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertTitle>Funcionalidad en Desarrollo</AlertTitle>
                <AlertDescription>
                   La selección de productos mensual estará disponible próximamente. De momento, recibirás una selección sorpresa de nuestros productos más vendidos.
                </AlertDescription>
            </Alert>


            <Card>
                <CardHeader>
                    <CardTitle>Portal de Cliente</CardTitle>
                    <CardDescription>
                        Aquí puedes gestionar tu suscripción, cambiar tu método de pago o cancelar tu plan en cualquier momento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleManageSubscription} disabled={portalLoading}>
                         {portalLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Settings className="mr-2 h-4 w-4" />
                        )}
                        {portalLoading ? 'Abriendo portal...' : 'Gestionar mi Suscripción'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Serás redirigido al portal seguro de Stripe.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
