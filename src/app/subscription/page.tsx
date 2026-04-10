'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Gift,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const SUBSCRIPTION_PRICE_CENTS = 4400;
const SUBSCRIPTION_PRICE_DISPLAY = '44,00 €';

export default function SubscriptionLandingPage() {
  const { t } = useTranslation();
  const { user, isSubscribed, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login?redirect=/subscription');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderId = `SUB_${user.uid}_${Date.now()}`;
      const baseUrl = window.location.origin;

      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          successUrl: `${baseUrl}/subscription/success`,
          cancelUrl: `${baseUrl}/subscription`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (data.checkoutUrl || data.url) {
        window.location.href = data.checkoutUrl || data.url;
      } else {
        throw new Error(t('subscription_landing.error_no_url'));
      }
    } catch (e: any) {
      setError(e.message || t('subscription_landing.error_generic'));
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Package,
      title: t('subscription_landing.feature_aromas_title'),
      desc: t('subscription_landing.feature_aromas_desc'),
    },
    {
      icon: Sparkles,
      title: t('subscription_landing.feature_accessory_title'),
      desc: t('subscription_landing.feature_accessory_desc'),
    },
    {
      icon: Gift,
      title: t('subscription_landing.feature_gift_title'),
      desc: t('subscription_landing.feature_gift_desc'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary font-bold">
          {t('subscription_landing.hero_title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subscription_landing.hero_subtitle')}
        </p>
        <p className="text-3xl font-bold text-primary">
          {SUBSCRIPTION_PRICE_DISPLAY}
          <span className="text-base font-normal text-muted-foreground"> / {t('subscription_landing.per_month')}</span>
        </p>
      </div>

      <Separator />

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <Card key={f.title} className="text-center">
            <CardHeader className="items-center space-y-3 pb-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{f.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* CTA */}
      <div className="text-center space-y-6">
        {authLoading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        ) : isSubscribed ? (
          <Alert className="max-w-lg mx-auto border-green-500/40 bg-green-50/50 dark:bg-green-950/20 text-left">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>{t('subscription_landing.already_member_title')}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{t('subscription_landing.already_member_desc')}</p>
              <Button asChild size="sm">
                <Link href="/account/subscription">
                  {t('account.subscription.customize_box_button')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="max-w-lg mx-auto text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('subscription_landing.error_title')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button size="lg" className="text-lg px-10 py-6" onClick={handleSubscribe} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Package className="mr-2 h-5 w-5" />
              )}
              {t('subscription_landing.hero_cta')}
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground">
                {t('subscription_landing.login_hint')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
