
'use client';

import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar();
  const { loading, isAuthenticated } = useAdminAuth();
  const isCollapsed = state === 'collapsed';
  
  // The middleware is the single source of truth for protecting this route.
  // We no longer need a client-side loading/auth check here, which was
  // causing an infinite loading state. If the user is on this page,
  // the middleware has already validated their session.
  
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
        <AdminAuthProvider>
            <SidebarProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </SidebarProvider>
            <Toaster />
        </AdminAuthProvider>
    </ThemeProvider>
  );
}
