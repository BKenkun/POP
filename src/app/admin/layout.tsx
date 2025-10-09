'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, isVerified } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    // If loading, do nothing yet.
    if (loading) return;

    const isVerifyPage = pathname === '/admin/verify';
    const isPortalPage = pathname === '/admin/portal';

    // If user is fully authenticated, but on verify or portal, redirect to admin dashboard
    if (isAuthenticated && (isVerifyPage || isPortalPage)) {
        router.replace('/admin');
        return;
    }
    
    // If not fully authenticated...
    if (!isAuthenticated) {
        // ...and not verified, and trying to access something other than the verify page, redirect to verify
        if (!isVerified && !isVerifyPage) {
            router.replace('/admin/verify');
        }
        // ...and is verified, but trying to access something other than the portal, redirect to portal
        if (isVerified && !isPortalPage) {
            router.replace('/admin/portal');
        }
    }

  }, [isAuthenticated, isVerified, loading, router, pathname]);

  // Publicly accessible pages for the admin flow
  if (pathname === '/admin/verify' || pathname === '/admin/portal') {
    return <>{children}</>;
  }

  // While checking auth, show a loader for any protected admin page
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the full admin panel layout
  return (
    <>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <AdminSidebar />
      </Sidebar>
      
      <div className={cn(
          "fixed left-2 top-2 z-20 hidden transition-opacity",
          isCollapsed ? "md:block opacity-100" : "opacity-0 pointer-events-none"
      )}>
          <SidebarTrigger />
      </div>
      
      <SidebarInset>
          <div className="p-4 md:p-8">
            {children}
          </div>
      </SidebarInset>
      <ThemeToggleButton />
    </>
  );
}


export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <SidebarProvider>
            <AdminAuthProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
                <Toaster />
            </AdminAuthProvider>
        </SidebarProvider>
    </ThemeProvider>
  );
}
