
"use client";

import Link from 'next/link';
import { Truck, PackageCheck, Search, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';

export function Header() {
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary-foreground">Popper España</span>
          </Link>
           <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild className="text-primary-foreground">
                <Link href="/products">
                    <ShoppingBag className="h-4 w-4 mr-2"/>
                    Ver Productos
                </Link>
              </Button>
               <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Button>
           </nav>
        </div>
        <div className="flex items-center justify-end text-sm font-medium">
           <div className="hidden sm:flex items-center gap-2">
                <PackageCheck className="h-5 w-5" />
                <span>Envío GRATIS a partir de 40€</span>
            </div>
        </div>
      </div>
    </header>
  );
}
