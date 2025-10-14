
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ShieldCheck, Truck, Box, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { StockNotificationDialog } from '@/components/stock-notification-dialog';
import { QuantitySelector } from '@/components/quantity-selector';
import { useToast } from '@/hooks/use-toast';

// This is the new Client Component that handles user interactions.
export function ProductInfoClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const isSoldOut = product.stock === 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };
  
  const handleQuantityChange = (newQuantity: number) => {
      if (product.stock !== undefined && newQuantity > product.stock) {
          toast({
              title: "Stock insuficiente",
              description: `Solo quedan ${product.stock} unidades de este producto.`,
              variant: "destructive"
          });
          setQuantity(product.stock);
      } else if (newQuantity < 1) {
          setQuantity(1);
      } else {
          setQuantity(newQuantity);
      }
  };

  return (
    <>
      {isSoldOut ? (
          <StockNotificationDialog product={product}>
               <Button size="lg" variant="outline">
                  <Bell className="mr-2 h-5 w-5" />
                  Avísame cuando vuelva
              </Button>
          </StockNotificationDialog>
      ) : (
          <div className="flex items-center gap-4">
              <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  maxStock={product.stock}
              />
              <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1"
              >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Añadir al carrito
              </Button>
          </div>
      )}

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
    </>
  );
}

// This is the new Server Component for displaying static info.
export function ProductInfo({ product }: { product: Product }) {
  const isSoldOut = product.stock === 0;

  return (
    <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
            {isSoldOut && (
                <Badge variant="destructive">Agotado</Badge>
            )}
            {!isSoldOut && product.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-headline text-primary font-bold">
          {product.name}
        </h1>
        <p className="text-3xl font-bold mt-2">{formatPrice(product.price)}</p>
        {product.description && (
            <p className="text-foreground/80 mt-4">{product.description}</p>
        )}
    </div>
  );
}
