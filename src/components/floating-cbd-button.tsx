
"use client";

import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function FloatingCbdButton() {
  const pathname = usePathname();

  // No mostrar el botón en las rutas de administrador
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-[13rem] right-6 z-50">
      <Button
        asChild
        variant="secondary"
        size="icon"
        className="relative h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
        aria-label="Visita nuestra tienda de CBD"
      >
        <Link href="https://comprarcbdonline.com" target="_blank" rel="noopener noreferrer">
          <Leaf className="h-7 w-7" />
        </Link>
      </Button>
    </div>
  );
}
