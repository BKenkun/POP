"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/60">
      <CardHeader className="p-0">
        <div className="relative h-64 w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={product.imageHint}
          />
          {product.tag && (
            <Badge variant="secondary" className="absolute top-4 right-4 text-sm">{product.tag}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-5 space-y-2">
        <CardTitle className="text-xl font-medium leading-snug tracking-normal">{product.name}</CardTitle>
        <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Añadir al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
