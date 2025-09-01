"use client";

import { CartProvider } from "./cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
