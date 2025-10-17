
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/context/providers';
import { ReactNode, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Setup font with next/font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Popper Online',
  description: 'La tienda oficial de productos Popper en España.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        {/* The font link in head is now handled by next/font, so we can remove it */}
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
          <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
            <Providers>
              {children}
            </Providers>
          </Suspense>
      </body>
    </html>
  );
}
