
'use client';

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import { CheckoutProvider } from "./checkout-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
// We no longer need FirebaseClientProvider, as the new AuthProvider will handle it.

export function Providers({ children }: { children: React.ReactNode }) {
    // The admin layout is now part of the main AppLayout logic via the Header component,
    // so we don't need a separate layout switcher here.
    const Layout = AppLayout;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <CookieProvider>
            <AuthProvider>
              <CartProvider>
                <CheckoutProvider>
                   <Layout>{children}</Layout>
                </CheckoutProvider>
              </CartProvider>
            </AuthProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
