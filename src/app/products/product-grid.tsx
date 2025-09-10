
'use client';

import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { ShoppingBag } from 'lucide-react';
import { CreatePackCard } from './create-pack-card';

interface ProductGridProps {
  products: Product[];
  showCreatePackCard?: boolean;
}

export default function ProductGrid({ products, showCreatePackCard = false }: ProductGridProps) {
  if (products.length === 0 && !showCreatePackCard) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16">
        <ShoppingBag className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
        <h2 className="mt-4 text-xl font-semibold">No se encontraron productos</h2>
        <p className="text-muted-foreground">Prueba a cambiar o eliminar los filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {showCreatePackCard && <CreatePackCard />}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
