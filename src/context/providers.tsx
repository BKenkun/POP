
"use client";

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/app/admin/layout";


export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');

    const PublicLayout = ({ children }: { children: React.ReactNode }) => (
      <AppLayout>
          {children}
          <Toaster />
          <CookieConsentBanner />
      </AppLayout>
    );

    const AdminWrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminLayout>
        {children}
      </AdminLayout>
    );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light" // Default to light for main site
      enableSystem={true} // Allow system for admin
      disableTransitionOnChange
    >
      <CookieProvider>
        <FirebaseClientProvider>
            <AuthProvider>
              <CartProvider>
                {isAdminRoute ? (
                    <AdminWrapper>{children}</AdminWrapper>
                ) : (
                    <PublicLayout>{children}</PublicLayout>
                )}
              </CartProvider>
            </AuthProvider>
        </FirebaseClientProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
