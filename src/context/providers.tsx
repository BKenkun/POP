
"use client";

import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";
import { CookieProvider } from "./cookie-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieProvider>
        <AuthProvider>
            <CartProvider>{children}</CartProvider>
        </AuthProvider>
    </CookieProvider>
  );
}
