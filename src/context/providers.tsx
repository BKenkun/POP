
'use client';

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import { CheckoutProvider } from "./checkout-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { LanguageProvider } from "./language-context";

export function Providers({ children }: { children: React.ReactNode }) {
    const Layout = AppLayout;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <CookieProvider>
        <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <CheckoutProvider>
                   <Layout>{children}</Layout>
                </CheckoutProvider>
              </CartProvider>
            </AuthProvider>
        </LanguageProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
