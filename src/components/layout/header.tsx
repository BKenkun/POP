"use client";

import Link from 'next/link';
import { Truck, PackageCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">Popper España</span>
          </Link>
        </div>
        <div className="hidden sm:flex items-center justify-center gap-x-8 text-sm font-medium">
            <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-primary" />
                <span>Envío GRATIS a partir de 40€</span>
            </div>
            <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span>Envíos 24/48h a península</span>
            </div>
        </div>
      </div>
    </header>
  );
}
