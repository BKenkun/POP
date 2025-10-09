
'use client';

import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { FirebaseClientProvider } from '@/firebase';
import { CookieProvider } from '@/context/cookie-context';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // El middleware ya ha protegido esta ruta.
  // El layout simplemente renderiza la interfaz de administración.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CookieProvider>
        <AdminAuthProvider>
          <FirebaseClientProvider>
            <SidebarProvider>
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
            </SidebarProvider>
            <Toaster />
          </FirebaseClientProvider>
        </AdminAuthProvider>
      </CookieProvider>
    </ThemeProvider>
  );
}
