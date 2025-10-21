
'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SalesNotification } from '@/components/sales-notification';
import FloatingActionButtons from '@/components/floating-action-buttons';
import { useCookieConsent } from '@/context/cookie-context';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import CookieConsentBanner from '../cookie-consent-banner';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { consent } = useCookieConsent();
  const pathname = usePathname();

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

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // For admin routes, we render the children directly,
    // as the AdminLayout from providers.tsx will wrap it.
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
      <SalesNotification />
      <FloatingActionButtons />
      <Toaster />
      <CookieConsentBanner />
    </>
  );
}
