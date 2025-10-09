
'use client';

import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { CookieProvider } from "./cookie-context";
import AppLayout from "@/components/layout/app-layout";
import { ThemeProvider } from "./theme-provider";
import { FirebaseClientProvider } from "@/firebase";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/app/admin/_components/admin-sidebar";
import ThemeToggleButton from '@/app/admin/_components/theme-toggle-button';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

function AdminArea({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <AdminSidebar />
      </Sidebar>
      <div className="fixed left-2 top-2 z-20 hidden transition-opacity md:block">
        <SidebarTrigger />
      </div>
      <SidebarInset>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </SidebarInset>
      <ThemeToggleButton />
      <Toaster />
    </SidebarProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');

    const PublicLayout = ({ children }: { children: React.ReactNode }) => (
      <AppLayout>
          {children}
      </AppLayout>
    );

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
                {isAdminRoute ? (
                    <AdminArea>{children}</AdminArea>
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
