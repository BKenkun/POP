
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
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  useEffect(() => {
    // If loading is finished and user is not authenticated, redirect to verify page
    if (!loading && !isAuthenticated) {
      router.replace('/verify');
    }
  }, [isAuthenticated, loading, router]);

  // While loading, or if not authenticated (before redirect kicks in), show loader.
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the admin panel layout
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
  const pathname = usePathname();
  // The verify page is public and does not need the admin panel layout.
  // It will get the provider wrapper below, but not the content wrapper.
  const isPublicAdminPage = ['/verify'].includes(pathname);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <AdminAuthProvider>
            {isPublicAdminPage ? (
              <>
                {children}
                <Toaster/>
              </>
            ) : (
               <SidebarProvider>
                  <AdminLayoutContent>{children}</AdminLayoutContent>
                  <Toaster />
              </SidebarProvider>
            )}
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
