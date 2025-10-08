
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, Box, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuantitySelector } from './quantity-selector';

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, volumeDiscount, totalWithDiscount } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    if(cartCount === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
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
                        src={item.imageUrl}
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
                  <span>Subtotal</span>
                  <span className={volumeDiscount > 0 ? 'line-through text-muted-foreground' : ''}>{formatPrice(cartTotal)}</span>
                </div>
                 {volumeDiscount > 0 && (
                    <>
                         <div className="flex justify-between text-destructive font-semibold">
                            <span>Descuento por volumen:</span>
                            <span>-{formatPrice(volumeDiscount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total con descuento</span>
                            <span>{formatPrice(totalWithDiscount)}</span>
                        </div>
                    </>
                )}
                 <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-primary" />
                        <span>Embalaje 100% discreto.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span>Envío 24/48h.</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Items are not reserved. Shipping and taxes calculated at checkout.
                </p>
                <Button asChild size="lg" className="w-full" onClick={handleCheckout}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
