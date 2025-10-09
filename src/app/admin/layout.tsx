
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

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    // Si la carga ha terminado y el usuario NO está autenticado,
    // y no están ya en la página de login, redirigir.
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Si está en la página de login, mostrarla sin el layout del panel.
  // Esto previene que se carguen componentes del panel (y sus hooks de datos)
  // antes de que el usuario haya podido iniciar sesión.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Mientras se verifica la autenticación, muestra un loader a pantalla completa
  // para cualquier otra página del panel.
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Si llegamos aquí, significa que el usuario está autenticado y no está en la página de login,
  // por lo que podemos renderizar el layout completo del panel de administración.
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
        <SidebarProvider>
            <AdminAuthProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
                <Toaster />
            </AdminAuthProvider>
        </SidebarProvider>
    </ThemeProvider>
  );
}
