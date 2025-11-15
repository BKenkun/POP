"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, Box, Truck, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuantitySelector } from './quantity-selector';
import { useTranslation } from '@/context/language-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const FREE_SHIPPING_THRESHOLD = 4000; // 40€

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, volumeDiscount, totalWithDiscount } = useCart();
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);

  const handleCheckout = () => {
    if(cartCount === 0) {
      toast({
        title: t('cart.empty_title'),
        description: t('cart.empty_subtitle'),
        variant: "destructive",
      });
      return;
    }
    onOpenChange(false);
  };
  
  const handleStripePayment = async () => {
      if (cartCount === 0) {
          toast({ title: t('cart.empty_title'), variant: "destructive" });
          return;
      }
      setIsProcessingStripe(true);
      try {
          const response = await fetch('/api/purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cartItems }),
          });
          const { checkoutUrl, error } = await response.json();
          if (error) throw new Error(error);
          if (checkoutUrl) {
              window.location.href = checkoutUrl;
          }
      } catch (error: any) {
          toast({ title: "Error de pago", description: error.message, variant: "destructive" });
          setIsProcessingStripe(false);
      }
  };

  const shippingCost = cartTotal > 0 && cartTotal < FREE_SHIPPING_THRESHOLD ? 695 : 0;
  const isFreeShipping = shippingCost === 0 && cartTotal > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>{t('cart.title')} ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        data-ai-hint={item.imageHint}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                         {item.id !== 'custom-pack' ? (
                            <QuantitySelector
                                quantity={item.quantity}
                                onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
                                maxStock={item.stock}
                            />
                         ) : (
                           <span className="text-sm text-muted-foreground">Cantidad: {item.quantity}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="bg-secondary/50 p-6">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold">
                  <span>{t('cart.subtotal')}</span>
                  <span className={volumeDiscount > 0 ? 'line-through text-muted-foreground' : ''}>{formatPrice(cartTotal)}</span>
                </div>
                 {volumeDiscount > 0 && (
                    <>
                         <div className="flex justify-between text-destructive font-semibold">
                            <span>{t('cart.volume_discount')}:</span>
                            <span>-{formatPrice(volumeDiscount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total con Descuento</span>
                            <span>{formatPrice(totalWithDiscount)}</span>
                        </div>
                    </>
                )}
                 <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-primary" />
                        <span>{t('cart.discreet_packaging')}</span>
                    </div>
                     {isFreeShipping ? (
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">{t('cart.free_shipping_banner')}</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <Truck className="h-4 w-4 text-primary" />
                           <span>{t('cart.free_shipping_threshold', {price: formatPrice(FREE_SHIPPING_THRESHOLD)})}</span>
                       </div>
                     )}
                </div>
                <div className="space-y-2">
                   <Button size="lg" className="w-full" onClick={handleStripePayment} disabled={isProcessingStripe}>
                        {isProcessingStripe ? <Loader2 className="mr-2 animate-spin" /> : <CreditCard className="mr-2" />}
                        Pagar con Tarjeta
                   </Button>
                   <Button asChild size="lg" className="w-full" onClick={handleCheckout} variant="outline">
                      <Link href="/checkout">Finalizar (Otros Métodos)</Link>
                   </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
            <h2 className="text-xl font-semibold">{t('cart.empty_title')}</h2>
            <p className="text-muted-foreground">{t('cart.empty_subtitle')}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
