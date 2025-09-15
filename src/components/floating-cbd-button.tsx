
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

<<<<<<< HEAD
=======
// Nuevo SVG para la hoja de Cannabis, más claro y definido
>>>>>>> eb9e8db (vale hay un problema, la imagen se ve rara y no se reconoce la forma. es)
const MarijuanaLeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M16.136 12.636a1 1 0 0 1-1.414-1.414l5.657-5.657a1 1 0 1 1 1.414 1.414l-5.657 5.657zM7.864 12.636a1 1 0 0 0 1.414-1.414L3.621 5.565a1 1 0 0 0-1.414 1.414l5.657 5.657zM12 16.25a1 1 0 0 1-1-1V3a1 1 0 1 1 2 0v12.25a1 1 0 0 1-1 1zM19.157 9.879a1 1 0 0 0-1.414 1.414l2.121 2.121c.53.53 1.258.643 1.89.333l1.9-.95a1 1 0 0 0-.894-1.789l-1.9.95a.482.482 0 0 1-.146.08l-1.557-1.154zM4.843 9.879a1 1 0 0 0 1.414 1.414l-2.121 2.121a1.482 1.482 0 0 1-.146.08l-1.9.95a1 1 0 1 0 .894-1.789l1.9-.95c.632-.31 1.36-.2 1.89.333l-.981-1.234zM15.408 17.5a1 1 0 0 1-1.414-1.414l3.535-3.536a1 1 0 1 1 1.414 1.414l-3.535 3.536zM8.592 17.5a1 1 0 0 0 1.414-1.414l-3.535-3.536a1 1 0 0 0-1.414 1.414l3.535 3.536zM13.5 22a1 1 0 0 1-1-1V16a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1z"></path>
    </svg>
);

export default function FloatingCbdButton() {
  return (
    <Button
      asChild
      variant="secondary"
      className="relative h-16 w-16 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white p-2 transition-transform hover:scale-110"
      aria-label="Visita nuestra tienda de CBD"
    >
      <Link href="https://comprarcbdonline.com" target="_blank" rel="noopener noreferrer">
        <MarijuanaLeafIcon className="h-full w-full" />
      </Link>
    </Button>
  );
}
