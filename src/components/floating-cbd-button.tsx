
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

// SVG for Marijuana Leaf
const MarijuanaLeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}
    >
        <path d="M16.136 12.636a1 1 0 0 1-1.414-1.414l5.657-5.657a1 1 0 1 1 1.414 1.414l-5.657 5.657zm-8.272 0a1 1 0 0 0 1.414-1.414L3.62 5.565a1 1 0 0 0-1.414 1.414l5.657 5.657zM12 16.25a1 1 0 0 1-1-1V3a1 1 0 1 1 2 0v12.25a1 1 0 0 1-1 1zm5.621-6.115a1 1 0 0 0-1.414 1.414l2.121 2.121c.53.53 1.258.643 1.89.333l1.898-.95a1 1 0 0 0 .101-1.78l-2.122-2.122a1 1 0 0 0-1.414-.016l-1.06 1.06zM6.379 10.135a1 1 0 0 0 1.414 1.414l-2.12 2.121a1.49 1.49 0 0 0-1.89.333l-1.9.95a1 1 0 0 1-.1-1.78l2.12-2.122a1 1 0 0 1 1.414-.016l1.06 1.06zM15.408 17.5a1 1 0 0 1-1.414-1.414l3.535-3.536a1 1 0 1 1 1.414 1.414l-3.535 3.536zm-6.816 0a1 1 0 0 0 1.414-1.414l-3.535-3.536a1 1 0 1 0-1.414 1.414l3.535 3.536zM13.5 22a1 1 0 0 1-1-1v-5a1 1 0 1 1 2 0v5a1 1 0 0 1-1 1z"/>
    </svg>
);


export default function FloatingCbdButton() {
  return (
    <Button
      asChild
      variant="secondary"
      className="relative h-24 w-24 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
      aria-label="Visita nuestra tienda de CBD"
    >
      <Link href="https://comprarcbdonline.com" target="_blank" rel="noopener noreferrer">
        <MarijuanaLeafIcon className="h-20 w-20" />
      </Link>
    </Button>
  );
}
