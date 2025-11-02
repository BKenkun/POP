
'use client';

import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/language-context';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  loading: boolean;
}

export function RelatedProducts({ currentProduct, allProducts, loading }: RelatedProductsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
       <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-headline text-primary font-bold">{t('related_products.title')}</h2>
        <div className="flex space-x-6">
          <Skeleton className="h-[400px] w-full min-w-60" />
          <Skeleton className="h-[400px] w-full min-w-60 hidden sm:block" />
          <Skeleton className="h-[400px] w-full min-w-60 hidden lg:block" />
          <Skeleton className="h-[400px] w-full min-w-60 hidden xl:block" />
        </div>
      </div>
    )
  }
  
  const relatedProducts = allProducts.filter(p => {
    if (p.id === currentProduct.id) return false;
    const currentTags = currentProduct.tags || [];
    const productTags = p.tags || [];
    // Find products that share at least one tag.
    return currentTags.some(tag => productTags.includes(tag));
  });

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-headline text-primary font-bold">{t('related_products.title')}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {relatedProducts.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
