
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FloatingCbdButton() {
  return (
    <Button
      asChild
      variant="secondary"
      className="relative h-16 w-16 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white transition-transform hover:scale-110 flex items-center justify-center text-xl font-bold"
      aria-label="Visita nuestra tienda de CBD"
    >
      <Link href="https://comprarcbdonline.com" target="_blank" rel="noopener noreferrer">
        <span className="drop-shadow-md">CBD</span>
      </Link>
    </Button>
  );
}
