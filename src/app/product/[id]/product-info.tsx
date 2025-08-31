'use client';

import { useCart } from '@/context/cart-context';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ShieldCheck, Truck, Box, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const isSoldOut = product.stock === 0;

  return (
    <div className="flex flex-col space-y-6">
      <div>
        {product.tag && !isSoldOut && (
          <Badge variant="secondary" className="mb-2">
            {product.tag}
          </Badge>
        )}
        {isSoldOut && (
            <Badge variant="destructive" className="mb-2">Agotado</Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-headline text-primary">
          {product.name}
        </h1>
        <p className="text-3xl font-bold mt-2">{formatPrice(product.price)}</p>
      </div>

      <div
        className="prose dark:prose-invert text-foreground/80"
        dangerouslySetInnerHTML={{ __html: product.description || '' }}
      />
      
      <Button
        size="lg"
        onClick={() => addToCart(product)}
        disabled={isSoldOut}
      >
        {isSoldOut ? (
          <>
            <XCircle className="mr-2 h-5 w-5" />
            Agotado
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Añadir al carrito
          </>
        )}
      </Button>

      <Separator />

      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>Compra segura y pago discreto garantizado.</p>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>Envío rápido en 24/48h a toda la península.</p>
        </div>
        <div className="flex items-center gap-3">
          <Box className="h-5 w-5 flex-shrink-0 text-primary" />
          <p>Embalaje 100% discreto sin marcas externas.</p>
        </div>
      </div>
    </div>
  );
}
