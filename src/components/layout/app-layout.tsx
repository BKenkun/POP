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
import AgeVerificationPopup from '../age-verification-popup';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { consent } = useCookieConsent();
  const pathname = usePathname();

  useEffect(() => {
    if (consent.analytics) {
      type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };
      const clarityWindow = window as Window & { clarity?: ClarityFunction };
      if (!clarityWindow.clarity) {
        const clarity: ClarityFunction = (...args: unknown[]) => {
          clarity.q = clarity.q ?? [];
          clarity.q.push(args);
        };
        clarityWindow.clarity = clarity;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.clarity.ms/tag/tc3cngb8to';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(script, firstScript);
      }
    }
  }, [consent.analytics]);

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
  }

  return (
    <>
      <AgeVerificationPopup />
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
