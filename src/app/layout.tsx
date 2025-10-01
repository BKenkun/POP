
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/context/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SalesNotification } from '@/components/sales-notification';
import FloatingActionButtons from '@/components/floating-action-buttons';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useCookieConsent } from '@/context/cookie-context';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { useEffect } from 'react';

// metadata object should not be here in a client component layout. 
// It should be in page.tsx files or a server component layout.
// export const metadata: Metadata = {
//   title: 'Popper Online',
//   description: 'La tienda oficial de productos Popper en España.',
// };

function AppLayout({ children }: { children: React.ReactNode }) {
  const { consent } = useCookieConsent();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  // Load Clarity script if consent is given
  useEffect(() => {
    if (consent.analytics) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "tc3cngb8to");
    }
  }, [consent.analytics]);

  if (isAdminPath) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
      <SalesNotification />
      <FloatingActionButtons />
      <CookieConsentBanner />
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Popper Online</title>
        <meta name="description" content="La tienda oficial de productos Popper en España." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
