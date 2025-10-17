

'use client';

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import { CheckoutProvider } from "./checkout-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
import { usePathname } from "next/navigation";
import AdminLayout from "../app/admin/layout"; // Assuming this is the correct path for AdminLayout

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');

    const Layout = isAdminRoute ? AdminLayout : AppLayout;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <CookieProvider>
        <FirebaseClientProvider>
            <AuthProvider>
              <CartProvider>
                <CheckoutProvider>
                   <Layout>{children}</Layout>
                </CheckoutProvider>
              </CartProvider>
            </AuthProvider>
        </FirebaseClientProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
