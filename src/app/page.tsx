
'use client';

import { ProductCard } from '@/components/product-card';
import { ShieldCheck, Truck, Box, CreditCard } from 'lucide-react';
import { Product } from '@/lib/types';
import SubscriptionForm from '@/components/subscription-form';
import WelcomePopupLoader from '@/components/welcome-popup-loader';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

function ProductSection({ title, products, loading }: { title: string; products: Product[]; loading: boolean; }) {
  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-headline text-primary font-bold">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-headline text-primary font-bold">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}


export default function Home() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'products'), where('active', '==', true));
  }, [firestore]);

  const { data: allProducts, isLoading: loadingProducts } = useCollection<Product>(productsQuery);

  const { newArrivals, bestSellers, offers } = useMemo(() => {
    const products = allProducts || [];
    return {
      newArrivals: products.filter(p => p.internalTags?.includes('novedad')),
      bestSellers: products.filter(p => p.internalTags?.includes('mas-vendido')),
      offers: products.filter(p => p.internalTags?.includes('oferta')),
    }
  }, [allProducts]);
  
  return (
    <div className="space-y-16">
      <WelcomePopupLoader />
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Calidad Premium, Sensaciones Únicas</h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          Explora nuestra cuidada selección de poppers y descubre una pureza y potencia que redefine la experiencia.
        </p>
      </div>

      <ProductSection title="Novedades" products={newArrivals} loading={loadingProducts} />
      <ProductSection title="Ofertas Especiales" products={offers} loading={loadingProducts} />
      <ProductSection title="Lo Más Vendido" products={bestSellers} loading={loadingProducts} />
      
       <div className="my-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left max-w-5xl mx-auto">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-base">Sítio Web 100% Seguro</h3>
                <p className="text-sm text-muted-foreground">Tu seguridad es nuestra prioridad.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-base">Pago Discreto</h3>
                <p className="text-sm text-muted-foreground">Sin referencias en tu extracto.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Box className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
               <div>
                <h3 className="font-semibold text-base">Embalaje Discreto</h3>
                <p className="text-sm text-muted-foreground">Paquetes sin marcas ni logos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
               <div>
                <h3 className="font-semibold text-base">Entrega Rápida</h3>
                <p className="text-sm text-muted-foreground">Recibe tu pedido en 24/48h.</p>
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
