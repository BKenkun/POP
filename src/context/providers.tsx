"use client";

import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";

export function Providers({ children }: { children: React.Node }) {
  return (
    <AuthProvider>
        <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
