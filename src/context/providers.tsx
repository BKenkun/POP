
"use client";

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import { usePathname } from "next/navigation";


export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicRoute = !pathname.startsWith('/admin') && !pathname.startsWith('/verify');

    // Admin routes have their own layout, so we render them directly.
    if (!isPublicRoute) {
        return <>{children}</>;
    }

  // All public routes are wrapped with all client-side providers.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
    >
      <CookieProvider>
        <FirebaseClientProvider>
            <AuthProvider>
              <CartProvider>
                <AppLayout>
                  {children}
                </AppLayout>
                <CookieConsentBanner />
              </CartProvider>
            </AuthProvider>
        </FirebaseClientProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
