
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Loader2, Settings, CalendarClock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubscriptionTimeline from "./_components/subscription-timeline";
import MonthlyBoxSelector from "./_components/monthly-box-selector";
import { Product } from "@/lib/types";
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cancelNowPaymentsSubscription } from "@/app/actions/manage-subscription";

export default function SubscriptionManagementPage() {
    const { user, isSubscribed, loading: authLoading, setUserDoc, userDoc } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [portalLoading, setPortalLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const dayOfMonth = new Date().getDate();
    const isSelectionWindowOpen = dayOfMonth >= 4 && dayOfMonth <= 25;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/account/subscription');
        } else if (!authLoading && user && !isSubscribed) {
            // Check the userDoc directly in case the context is not updated yet
            if(userDoc && !userDoc.isSubscribed) {
                router.push('/subscription');
            }
        }
    }, [user, isSubscribed, userDoc, authLoading, router]);

    useEffect(() => {
        const fetchProducts = async () => {
            const productsQuery = query(collection(db, 'products'), where('active', '==', true));
            const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
                const fetchedProducts: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(fetchedProducts);
                setLoadingProducts(false);
            }, (error) => {
                console.error("Failed to fetch products for subscription page", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los productos para la selección.",
                    variant: "destructive"
                });
                setLoadingProducts(false);
            });
            return () => unsubscribe();
        };
        fetchProducts();
    }, [toast]);
    
    const poppers = products.filter(p => !p.internalTags?.includes('accesorio') && !p.internalTags?.includes('pack'));
    const accessories = products.filter(p => p.internalTags?.includes('accesorio'));
    
    // Safely check if a subscription exists and is active before allowing cancellation.
    const canManageSubscription = !!userDoc?.subscription?.sub_id && userDoc.isSubscribed;

    const handleCancelSubscription = async () => {
        if (!canManageSubscription) {
             toast({
                title: "Error",
                description: "No se encontró una suscripción activa para gestionar.",
                variant: "destructive"
            });
            return;
        }

        setPortalLoading(true);
        const result = await cancelNowPaymentsSubscription();
        if (result.success) {
            toast({
                title: "Suscripción Cancelada",
                description: result.message,
            });
            // Optimistically update the user document in the context
            if (userDoc) {
                setUserDoc({ ...userDoc, isSubscribed: false, subscription: { ...userDoc.subscription, status: 'cancelled' } });
            }
            router.push('/account'); // Redirect to account page
        } else {
            toast({
                title: "Error al Cancelar",
                description: result.message,
                variant: "destructive"
            });
        }
        setPortalLoading(false);
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
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button disabled={portalLoading || !canManageSubscription} variant="destructive">
                            {portalLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Settings className="mr-2 h-4 w-4" />
                            )}
                            {portalLoading ? 'Cancelando...' : 'Gestionar mi Suscripción'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Gestionar Suscripción</AlertDialogTitle>
                            <AlertDialogDescription>
                               Actualmente, la gestión de la suscripción (como cambiar el método de pago) debe hacerse contactando a soporte. Sin embargo, puedes cancelar tu suscripción inmediatamente si lo deseas. ¿Estás seguro de que quieres cancelar tu suscripción?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cerrar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Sí, cancelar suscripción
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                 {!canManageSubscription && <p className="text-xs text-muted-foreground mt-2">No se encontró una suscripción activa para gestionar.</p>}
            </div>
        </div>
    )
}
