
"use client";

import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";
import { CookieProvider } from "./cookie-context";
import { FirebaseClientProvider } from "@/firebase";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <CookieProvider>
          <FirebaseClientProvider>
              <AuthProvider>
                  <CartProvider>
                    <AppLayout>
                      {children}
                    </AppLayout>
                    <Toaster />
                  </CartProvider>
              </AuthProvider>
          </FirebaseClientProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
