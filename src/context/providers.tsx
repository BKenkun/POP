
"use client";

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "./admin-auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // For admin routes, we provide a different context layout
  if (pathname.startsWith('/admin') || pathname.startsWith('/verify')) {
    return (
       <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    );
  }
  
  // For public routes, we wrap with all client-side providers
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
    >
      <CookieProvider>
        <FirebaseClientProvider>
          <AdminAuthProvider>
            <AuthProvider>
              <CartProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </CartProvider>
            </AuthProvider>
          </AdminAuthProvider>
        </FirebaseClientProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
