
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and user is not an admin, redirect.
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);


  // While loading, or if the user is not an admin yet, show a spinner
  // to prevent content flash and premature redirection.
  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // User is confirmed to be an admin, render the admin layout
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
