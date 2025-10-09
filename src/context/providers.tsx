
"use client";

import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";
import { CookieProvider } from "./cookie-context";
import { FirebaseClientProvider } from "@/firebase";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieProvider>
        <FirebaseClientProvider>
            <AuthProvider>
                <CartProvider>{children}</CartProvider>
            </AuthProvider>
        </FirebaseClientProvider>
    </CookieProvider>
  );
}
