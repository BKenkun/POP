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
import { AuthProvider } from '@/context/auth-context';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // These pages are publicly accessible within the admin route
  const publicAdminPages = ['/admin/verify', '/admin/portal'];
  const isPublicPage = publicAdminPages.includes(pathname);

  useEffect(() => {
    if (loading) return; // Don't do anything while loading session state

    if (!isAuthenticated && !isPublicPage) {
      // If not authenticated and not on a public admin page, redirect to verify
      router.replace('/admin/verify');
    } else if (isAuthenticated && isPublicPage) {
      // If authenticated and on a public page, redirect to the main admin dashboard
      router.replace('/admin');
    }
  }, [isAuthenticated, loading, router, pathname, isPublicPage]);

  // If it's a public page, render it directly without the main layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // If loading, or not yet authenticated for a protected page, show a full-screen loader
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated and on a protected page, render the full admin layout
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
      <AuthProvider>
        <AdminAuthProvider>
            <SidebarProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
                <Toaster />
            </SidebarProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
