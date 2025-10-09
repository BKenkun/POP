
'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
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
        <SidebarProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
