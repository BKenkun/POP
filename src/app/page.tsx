
import { ProductCard } from '@/components/product-card';
import { getStripeProducts } from '@/lib/stripe';
import { ShieldCheck, Truck, Box, CreditCard } from 'lucide-react';
import { Product } from '@/lib/types';
import ClientOnlyFeatures from '@/components/client-only-features';
import SubscriptionForm from '@/components/subscription-form';
import { ProductCarousel } from '@/components/product-carousel';
import { Separator } from '@/components/ui/separator';


export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  const allProducts: Product[] = await getStripeProducts();

  const newArrivals = allProducts.filter(p => p.internalTags?.includes('novedad'));
  const bestSellers = allProducts.filter(p => p.internalTags?.includes('mas-vendido'));
  const offers = allProducts.filter(p => p.internalTags?.includes('oferta'));
  
  return (
    <div className="space-y-16">
      <ClientOnlyFeatures />
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Calidad Premium, Sensaciones Únicas</h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          Explora nuestra cuidada selección de poppers y descubre una pureza y potencia que redefine la experiencia.
        </p>
      </div>

      {newArrivals.length > 0 && (
        <ProductCarousel title="Novedades" products={newArrivals} />
      )}

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
      
      {offers.length > 0 && (
         <ProductCarousel title="Ofertas Especiales" products={offers} />
      )}

      <div className="my-12">
        <SubscriptionForm />
      </div>

      {bestSellers.length > 0 && (
         <ProductCarousel title="Lo Más Vendido" products={bestSellers} />
      )}
      
    </div>
  );
}
