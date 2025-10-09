
"use client";

import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/admin') || pathname.startsWith('/verify')) {
    return <>{children}</>;
  }
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <CookieProvider>
          <CartProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </CartProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
