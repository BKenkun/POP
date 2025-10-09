
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
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    // If loading is finished, and the user is NOT authenticated,
    // and they are not already on the login page, redirect them.
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // While checking auth, show a global loader for any page other than login.
  if (loading && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we are on the login page OR if we are not authenticated yet (even after loading),
  // just render the children. This allows the login page to be displayed without the admin layout.
  if (pathname === '/admin/login' || !isAuthenticated) {
    return <>{children}</>;
  }

  // If we get here, it means we are authenticated and not on the login page,
  // so we can render the full admin layout.
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
