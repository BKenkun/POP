
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Gift, Package, Sparkles, Loader2, UserPlus, ShoppingBag, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import { createNowPaymentsInvoice } from '@/app/actions/nowpayments';
import { useTranslation } from '@/context/language-context';


export default function SubscriptionPage() {
    const { user, loading: authLoading, isSubscribed } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const benefits = [
        { icon: Package, title: t('subscription_page.benefit1_title'), description: t('subscription_page.benefit1_desc') },
        { icon: Sparkles, title: t('subscription_page.benefit2_title'), description: t('subscription_page.benefit2_desc') },
        { icon: Gift, title: t('subscription_page.benefit3_title'), description: t('subscription_page.benefit3_desc') },
    ];

    const howItWorks = [
        { icon: UserPlus, title: t('subscription_page.howitworks1_title'), description: t('subscription_page.howitworks1_desc') },
        { icon: Settings, title: t('subscription_page.howitworks2_title'), description: t('subscription_page.howitworks2_desc') },
        { icon: ShoppingBag, title: t('subscription_page.howitworks3_title'), description: t('subscription_page.howitworks3_desc') },
    ];
    
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
                <p className="ml-4">{t('subscription_page.redirect_message')}</p>
            </div>
        );
    }


    const handleSubscribe = async () => {
        if (!user) {
            toast({
                title: t('subscription_page.login_required_title'),
                description: t('subscription_page.login_required_desc'),
                variant: "destructive"
            });
            router.push('/login?redirect=/subscription');
            return;
        }

        setLoading(true);

        try {
            const result = await createNowPaymentsInvoice({
                price_amount: 44,
                price_currency: 'eur',
                order_id: `sub_${user.uid}_${Date.now()}`,
                order_description: 'Suscripción Club Dosis Mensual'
            });
            
            if (result.success && result.invoice_url) {
                toast({
                    title: t('subscription_page.redirecting_toast_title'),
                    description: t('subscription_page.redirecting_toast_desc')
                });
                window.location.href = result.invoice_url;
            } else {
                throw new Error(result.error || t('subscription_page.start_error_generic'));
            }

        } catch (error: any) {
            console.error("Subscription Error:", error);
            toast({
                title: t('subscription_page.start_error_title'),
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">{t('subscription_page.title')}</h1>
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                   {t('subscription_page.subtitle')}
                </p>
            </div>

            <Card className="grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-lg border-primary/20">
                <div className="flex flex-col p-8 justify-center">
                     <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-3xl font-bold flex items-center gap-2">
                           <Sparkles className="h-8 w-8 text-primary" />
                           {t('subscription_page.plan_title')}
                        </CardTitle>
                        <CardDescription>{t('subscription_page.plan_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                         <div>
                            <p className="text-5xl font-bold text-primary">44€<span className="text-2xl text-muted-foreground">/{t('subscription_page.per_month')}</span></p>
                            <p className="text-sm text-muted-foreground mt-1">{t('subscription_page.price_desc')}</p>
                        </div>
                        <Button size="lg" className="w-full" onClick={handleSubscribe} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                            {loading ? t('subscription_page.processing_button') : t('subscription_page.join_button')}
                        </Button>
                    </CardContent>
                </div>
                <div className="relative h-64 md:h-auto min-h-[300px]">
                    <Image src="https://picsum.photos/seed/sub-main/600/800" alt="Caja de suscripción mensual" fill className="object-cover" data-ai-hint="subscription box"/>
                </div>
            </Card>

            <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-foreground">{t('subscription_page.howitworks_title')}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('subscription_page.howitworks_subtitle')}</p>
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
                <h2 className="text-3xl font-bold text-foreground">{t('subscription_page.includes_title')}</h2>
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
                    {loading ? t('subscription_page.processing_button') : t('subscription_page.join_button_price', {price: '44€'})}
                </Button>
            </div>
        </div>
    );
}
