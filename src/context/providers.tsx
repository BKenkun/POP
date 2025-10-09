
"use client";

import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";
import { CookieProvider } from "./cookie-context";
import { FirebaseClientProvider } from "@/firebase";
import AppLayout from "@/components/layout/app-layout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieProvider>
        <FirebaseClientProvider>
            <AuthProvider>
                <CartProvider>
                  <AppLayout>
                    {children}
                  </AppLayout>
                </CartProvider>
            </AuthProvider>
        </FirebaseClientProvider>
    </CookieProvider>
  );
}
