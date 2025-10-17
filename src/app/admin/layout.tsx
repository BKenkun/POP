
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AdminSidebar from './_components/admin-sidebar';
import { Loader2 } from 'lucide-react';
import ThemeToggleButton from './_components/theme-toggle-button';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login page with a redirect-back URL
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        // If logged in but not an admin, redirect to the main account page
        router.push('/account');
      }
    }
  }, [user, isAdmin, loading, router]);

  // While loading authentication state, show a full-screen loader
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no user, or the user is not an admin, render nothing.
  // The useEffect above will handle the redirection.
  if (!user || !isAdmin) {
    return null;
  }

  // If user is an admin, render the admin layout
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            {/* You can place a breadcrumb or title here */}
          </div>

          <div className="flex items-center gap-2">
            {/* Additional header items can go here */}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
      <ThemeToggleButton />
    </SidebarProvider>
  );
}
