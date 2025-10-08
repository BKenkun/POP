
'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If finished loading and not authenticated, redirect to login.
    // This check also prevents redirection while on the login page itself.
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // While loading authentication status, show a full-page loader.
  // This prevents rendering a protected page before the auth check is complete.
  if (loading && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we are on the login page, or if the user is not authenticated yet, let the page component handle it.
  if (pathname === '/admin/login' || !isAuthenticated) {
    return <>{children}</>;
  }


  // If authenticated, render the full admin layout.
  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      <SidebarProvider>
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
        <SidebarInset>
          <div className="p-4 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <ThemeToggleButton />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminAuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
        <Toaster />
    </AdminAuthProvider>
  );
}
