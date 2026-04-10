'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SubscriptionTimeline from './_components/subscription-timeline';
import MonthlyBoxSelector from './_components/monthly-box-selector';

export default function AccountSubscriptionPage() {
  const { t } = useTranslation();
  const { user, isSubscribed, loading: authLoading } = useAuth();
  const router = useRouter();

  const [poppers, setPoppers] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const today = new Date().getDate();
  const isSelectionWindowOpen = today >= 1 && today <= 4;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account/subscription');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const snap = await getDocs(query(productsRef, where('active', '==', true)));
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);

        setPoppers(
          all.filter(
            (p) =>
              !p.internalTags?.includes('accesorio') &&
              !p.internalTags?.includes('pack') &&
              !p.internalTags?.includes('juguete')
          )
        );
        setAccessories(all.filter((p) => p.internalTags?.includes('accesorio')));
      } catch (err) {
        console.error('Error loading products for subscription selector:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 space-y-6 text-center">
        <Alert className="text-left">
          <AlertTitle>{t('subscription_landing.not_subscribed_title')}</AlertTitle>
          <AlertDescription>{t('subscription_landing.not_subscribed_desc')}</AlertDescription>
        </Alert>
        <Button asChild size="lg">
          <Link href="/subscription">{t('subscription_landing.hero_cta')}</Link>
        </Button>
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-primary font-bold">
          {t('account.subscription.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSelectionWindowOpen
            ? t('subscription_landing.selection_open_hint')
            : t('subscription_landing.selection_closed_hint')}
        </p>
      </div>

      <SubscriptionTimeline day={today} />

      <MonthlyBoxSelector
        isSelectionWindowOpen={isSelectionWindowOpen}
        poppers={poppers}
        accessories={accessories}
      />
    </div>
  );
}
