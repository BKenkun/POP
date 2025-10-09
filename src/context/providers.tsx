
"use client";

import { CartProvider } from "./cart-context";
import { AuthProvider } from "./auth-context";
import { CookieProvider } from "./cookie-context";
import { FirebaseClientProvider } from "@/firebase";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Do not wrap admin or verify routes with the client-side providers
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
    </ThemeProvider>
  );
}
