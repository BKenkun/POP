'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { ShieldCheck, Truck, Box, CreditCard } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import SubscriptionForm from '@/components/subscription-form';
import WelcomePopupLoader from '@/components/welcome-popup-loader';
import { db } from '@/lib/firebase';
import { useTranslation } from '@/context/language-context';
import type { Product } from '@/lib/types';

function ProductSection({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-headline text-primary font-bold">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function HomeClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const { t } = useTranslation();

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const prods = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        if (prods.length > 0) {
          setAllProducts(prods);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error, keeping SSR products:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const { newArrivals, bestSellers, offers } = useMemo(() => {
    const products = allProducts.filter((p) => p.active !== false);
    return {
      newArrivals: products.filter((p) => p.internalTags?.includes('novedad')),
      bestSellers: products.filter((p) =>
        p.internalTags?.includes('mas-vendido')
      ),
      offers: products.filter((p) => p.internalTags?.includes('oferta')),
    };
  }, [allProducts]);

  return (
    <div className="space-y-16">
      <WelcomePopupLoader />

      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">
          {t('home.hero_title')}
        </h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          {t('home.hero_subtitle')}
        </p>
      </div>

      <ProductSection
        title={t('home.section_title_new')}
        products={newArrivals}
      />
      <ProductSection title={t('home.section_title_offers')} products={offers} />
      <ProductSection
        title={t('home.section_title_bestsellers')}
        products={bestSellers}
      />

      <div className="my-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left max-w-5xl mx-auto">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-base">
                {t('home.feature_secure_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('home.feature_secure_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-base">
                {t('home.feature_discreet_payment_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('home.feature_discreet_payment_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Box className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-base">
                {t('home.feature_discreet_packaging_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('home.feature_discreet_packaging_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-base">
                {t('home.feature_fast_shipping_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('home.feature_fast_shipping_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="my-12">
        <SubscriptionForm />
      </div>
    </div>
  );
}
