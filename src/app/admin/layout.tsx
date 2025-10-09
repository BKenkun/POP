
'use client';

import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';

// This layout is now simplified to trust the middleware for auth protection.
// It no longer contains client-side auth checks.
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
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
