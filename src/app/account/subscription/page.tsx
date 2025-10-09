
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Loader2, Settings, CalendarClock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createStripePortalAction } from "@/app/actions/manage-subscription";
import SubscriptionTimeline from "./_components/subscription-timeline";
import MonthlyBoxSelector from "./_components/monthly-box-selector";
import { Product } from "@/lib/types";
import { cbdProducts } from "@/lib/cbd-products";

export default function SubscriptionManagementPage() {
    const { user, isSubscribed, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [portalLoading, setPortalLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const dayOfMonth = new Date().getDate();
    const isSelectionWindowOpen = dayOfMonth >= 4 && dayOfMonth <= 25;

    useEffect(() => {
        if (!authLoading && (!user || !isSubscribed)) {
            router.push('/');
        }
    }, [user, isSubscribed, authLoading, router]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products from local mock data
                setProducts(cbdProducts);
            } catch (error) {
                console.error("Failed to fetch products for subscription page", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los productos para la selección.",
                    variant: "destructive"
                });
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, [toast]);
    
    const poppers = products.filter(p => !p.internalTags?.includes('accesorio') && !p.internalTags?.includes('pack'));
    const accessories = products.filter(p => p.internalTags?.includes('accesorio'));

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
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Personaliza tu Dosis Mensual</h2>
                <p className="text-muted-foreground">
                    {isSelectionWindowOpen 
                        ? "Elige tus productos favoritos para la caja de este mes."
                        : "La ventana de selección está cerrada. Revisa el estado de tu envío."
                    }
                </p>
            </div>

            <Card className="bg-secondary/40 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <CalendarClock className="h-5 w-5"/>
                        <span>Ventana de selección: del 4 al 25 de cada mes. Envíos: del 26 al 3 del mes siguiente.</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SubscriptionTimeline day={dayOfMonth} />
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Nota: Si no realizas ningún cambio, te enviaremos la misma selección que el mes anterior. Si es tu primer mes, te enviaremos una selección sorpresa de nuestros productos más vendidos.
                    </p>
                </CardContent>
            </Card>
            
            {loadingProducts ? (
                 <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4">Cargando productos...</p>
                </div>
            ) : (
                <MonthlyBoxSelector 
                    isSelectionWindowOpen={isSelectionWindowOpen}
                    poppers={poppers}
                    accessories={accessories}
                />
            )}

            <div className="text-center pt-4">
                 <Button onClick={handleManageSubscription} disabled={portalLoading} variant="outline">
                    {portalLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Settings className="mr-2 h-4 w-4" />
                    )}
                    {portalLoading ? 'Abriendo portal...' : 'Gestionar mi Suscripción (Cancelar / Cambiar Pago)'}
                </Button>
            </div>
        </div>
    )
}
