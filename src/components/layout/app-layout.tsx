
'use client';

import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SalesNotification } from '@/components/sales-notification';
import FloatingActionButtons from '@/components/floating-action-buttons';
import { usePathname } from 'next/navigation';
import { useCookieConsent } from '@/context/cookie-context';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { useEffect } from 'react';
import { AdminAuthProvider } from '@/context/admin-auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { consent } = useCookieConsent();
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const isVerifyPath = pathname.startsWith('/verify');

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
    return <>{children}</>
  }
  
  if(isVerifyPath) {
    return (
      <AdminAuthProvider>
         {children}
        <Toaster />
      </AdminAuthProvider>
    )
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
