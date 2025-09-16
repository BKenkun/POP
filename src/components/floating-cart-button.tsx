
"use client";

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { CartSheet } from '@/components/cart-sheet';

export default function FloatingCartButton() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <Button
          variant="default"
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground transition-transform hover:scale-110"
          aria-label="Open cart"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="h-7 w-7" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {cartCount}
            </span>
          )}
        </Button>
      </div>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
