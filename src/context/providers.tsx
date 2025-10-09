
"use client";

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
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
