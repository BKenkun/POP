
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
    if (!loading && !isAuthenticated) {
      router.replace('/verify');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
  // The verify and positive pages are public but still need the admin auth context.
  const isPublicPage = ['/verify', '/positive'].includes(pathname);

  if (isPublicPage) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <AdminAuthProvider>
            {children}
            <Toaster />
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  }

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
