
'use client';

import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { AdminAuthProvider } from '@/context/admin-auth-context';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  // El middleware es la única fuente de verdad para proteger las rutas /admin.
  // No se necesita ninguna comprobación de estado de carga o autenticación aquí.
  return (
    <>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <AdminSidebar />
      </Sidebar>

      <div className={cn("fixed left-2 top-2 z-20 hidden transition-opacity md:block")}>
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
