
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MarijuanaLeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M16.136,12.636a1,1,0,0,1-1.414-1.414l5.657-5.657a1,1,0,1,1,1.414,1.414l-5.657,5.657ZM7.864,12.636a1,1,0,0,0,1.414-1.414L3.621,5.565a1,1,0,0,0-1.414,1.414l5.657,5.657ZM12,16.25a1,1,0,0,1-1-1V3a1,1,0,1,1,2,0V15.25A1,1,0,0,1,12,16.25Zm5.621-6.115a1,1,0,0,0-1.414,1.414l2.121,2.121c.53.53,1.258.643,1.89.333l1.9-.95a1,1,0,1,0-.894-1.789l-1.9.95c-.053.027-.1.053-.146.08l-2.121-2.121a1,1,0,0,0-1.414-.016l-1.06,1.06ZM6.379,10.135a1,1,0,0,0,1.414,1.414l-2.121,2.121a1.482,1.482,0,0,0-.146.08l-1.9.95a1,1,0,1,1-.894-1.789l1.9-.95c.632-.31,1.36-.2,1.89.333l2.121-2.121a1,1,0,0,1,1.414-.016l1.06,1.06ZM15.408,17.5a1,1,0,0,1-1.414-1.414l3.535-3.536a1,1,0,1,1,1.414,1.414l-3.535,3.536ZM8.592,17.5a1,1,0,0,0,1.414-1.414l-3.535-3.536a1,1,0,1,0-1.414,1.414l3.535,3.536ZM13.5,22a1,1,0,0,1-1-1V16a1,1,0,1,1,2,0v5A1,1,0,0,1,13.5,22Z" />
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
