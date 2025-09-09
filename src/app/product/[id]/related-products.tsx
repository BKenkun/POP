
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

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
}

export function RelatedProducts({ currentProduct, allProducts }: RelatedProductsProps) {
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
      <h2 className="text-2xl md:text-3xl font-headline text-primary font-bold">Productos Relacionados</h2>
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
