"use client";

import Link from 'next/link';
import { ShoppingCart, Truck, PackageCheck } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { CartSheet } from '@/components/cart-sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
          <div className="container flex items-center justify-center gap-x-8">
              <div className="flex items-center gap-2">
                  <PackageCheck className="h-5 w-5" />
                  <span>Envío GRATIS a partir de 40€</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  <span>Envíos 24/48h a península</span>
              </div>
          </div>
      </div>
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl text-primary">Popper España</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Open cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
