
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { SearchForm } from './search-form';
import { PackageCheck, Truck } from 'lucide-react';

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
              <Button variant="ghost" asChild className="text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                <Link href="/products">
                    Productos
                </Link>
              </Button>
               <SearchForm />
           </nav>
        </div>
        <div className="hidden sm:flex items-center justify-end gap-x-4 text-xs font-medium">
           <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4" />
                <span>Envío GRATIS +40€</span>
            </div>
            <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Entrega 24/48h</span>
            </div>
        </div>
      </div>
    </header>
  );
}
