
'use client';

import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import ProtectedAdminRoute from '@/context/protected-admin-route';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  return (
    <ProtectedAdminRoute>
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
    </ProtectedAdminRoute>
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
        <AdminAuthProvider>
            <SidebarProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </SidebarProvider>
            <Toaster />
        </AdminAuthProvider>
    </ThemeProvider>
  );
}
