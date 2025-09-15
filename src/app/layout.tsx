
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/context/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SalesNotification } from '@/components/sales-notification';
import FloatingCartButton from '@/components/floating-cart-button';
import FloatingAccountButton from '@/components/floating-account-button';

export const metadata: Metadata = {
  title: 'Popper España',
  description: 'La tienda oficial de productos Popper en España.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <SalesNotification />
          <FloatingAccountButton />
          <FloatingCartButton />
        </Providers>
      </body>
    </html>
  );
}
