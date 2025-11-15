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
import { useTranslation } from "@/context/language-context";

export default function SubscriptionManagementPage() {
    const { user, isSubscribed, loading: authLoading, setUserDoc, userDoc } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useTranslation();
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
    
    const canManageSubscription = !!userDoc?.subscription?.sub_id && userDoc.isSubscribed;

    const handleCancelSubscription = async () => {
        if (!canManageSubscription) {
             toast({
                title: t('account.subscription.error_title'),
                description: t('account.subscription.no_subscription_found'),
                variant: "destructive"
            });
            return;
        }

        setPortalLoading(true);
        const result = await cancelNowPaymentsSubscription();
        if (result.success) {
            toast({
                title: t('account.subscription.cancellation_success_title'),
                description: result.message,
            });
            if (userDoc) {
                setUserDoc({ ...userDoc, isSubscribed: false, subscription: { ...userDoc.subscription, status: 'cancelled' } });
            }
            router.push('/account'); 
        } else {
            toast({
                title: t('account.subscription.cancellation_error_title'),
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
                <h2 className="text-2xl font-bold">{t('account.subscription.title')}</h2>
                <p className="text-muted-foreground">
                    {isSelectionWindowOpen 
                        ? t('account.subscription.subtitle_open')
                        : t('account.subscription.subtitle_closed')
                    }
                </p>
            </div>

            <Card className="bg-secondary/40 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <CalendarClock className="h-5 w-5"/>
                        <span>{t('account.subscription.timeline_info')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SubscriptionTimeline day={dayOfMonth} />
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        {t('account.subscription.timeline_note')}
                    </p>
                </CardContent>
            </Card>
            
            {loadingProducts ? (
                 <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4">{t('account.subscription.loading_products')}</p>
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
                            {portalLoading ? t('account.subscription.cancelling_button') : t('account.subscription.manage_button')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('account.subscription.manage_dialog_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                               {t('account.subscription.manage_dialog_desc')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('account.subscription.manage_dialog_close')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                {t('account.subscription.manage_dialog_confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                 {!canManageSubscription && <p className="text-xs text-muted-foreground mt-2">{t('account.subscription.no_subscription_found')}</p>}
            </div>
        </div>
    )
}
