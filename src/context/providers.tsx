
"use client";

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
import { AdminAuthProvider } from "./admin-auth-context";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";


export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');

    // Admin routes have their own layout and providers, so we render them directly.
    if (isAdminRoute) {
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
          <AdminAuthProvider>
            <AuthProvider>
              <CartProvider>
                <AppLayout>
                  {children}
                </AppLayout>
                <CookieConsentBanner />
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </AdminAuthProvider>
        </FirebaseClientProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
