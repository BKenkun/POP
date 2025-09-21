
"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Bell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StockNotificationDialog } from '@/components/stock-notification-dialog';
import { useState } from 'react';
import { QuantitySelector } from './quantity-selector';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
  children?: React.ReactNode;
  onImageClick?: () => void;
}

export function ProductCard({ product, className, children, onImageClick }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const isSoldOut = product.stock === 0;

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, quantity);
  }

  const cardContent = (
    <Card className={cn("group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-border/60 h-full", className)}>
        <div className="flex-grow flex flex-col">
            <CardHeader className="p-0 relative">
                {onImageClick ? (
                    <div onClick={onImageClick} className="cursor-pointer">
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="text-white h-10 w-10" />
                        </div>
                        <div className="relative h-64 w-full">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                data-ai-hint={product.imageHint}
                            />
                        </div>
                    </div>
                ) : (
                    <Link href={`/product/${product.id}`}>
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="text-white h-10 w-10" />
                        </div>
                        <div className="relative h-64 w-full">
                             <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-contain p-4"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                data-ai-hint={product.imageHint}
                            />
                        </div>
                    </Link>
                )}
                 {isSoldOut && (
                    <Badge variant="secondary" className="absolute bottom-4 left-4 text-sm z-20">Agotado</Badge>
                )}
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                    {product.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </CardHeader>
            

            <CardContent className="flex-grow p-5 space-y-2">
              <Link href={`/product/${product.id}`}>
                  <CardTitle className="text-xl font-medium leading-snug tracking-normal text-foreground group-hover:text-primary hover:text-destructive transition-colors">
                      {product.name}
                  </CardTitle>
              </Link>
              <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
            </CardContent>
        </div>
        {children ? (
            children
        ) : (
            <CardFooter className="p-5 pt-0">
                {isSoldOut ? (
                    <div className="group/footer-buttons flex items-center w-full gap-2">
                        <Button
                            variant="outline"
                            className="w-full transition-all duration-300 ease-in-out group-hover/footer-buttons:w-1/2"
                            disabled
                        >
                            Agotado
                        </Button>
                        <StockNotificationDialog product={product}>
                            <Button
                                variant="default"
                                className="p-0 rounded-full transition-all duration-300 ease-in-out w-12 h-12 flex-shrink-0 group-hover/footer-buttons:w-1/2 group-hover/footer-buttons:rounded-md"
                            >
                                <span className="flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-primary-foreground transition-all duration-300 group-hover/footer-buttons:mr-2 group-hover/footer-buttons:text-accent-foreground" />
                                    <span className="w-0 overflow-hidden text-accent-foreground font-bold whitespace-nowrap transition-all duration-300 group-hover/footer-buttons:w-16">
                                        Avísame
                                    </span>
                                </span>
                            </Button>
                        </StockNotificationDialog>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 w-full">
                        <QuantitySelector 
                            quantity={quantity}
                            onQuantityChange={handleQuantityChange}
                            maxStock={product.stock}
                        />
                        <Button
                            size="lg"
                            className="w-full flex-1"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Añadir
                        </Button>
                    </div>
                )}
            </CardFooter>
        )}
    </Card>
  )

  return children ? <div className="h-full">{cardContent}</div> : cardContent;
}
