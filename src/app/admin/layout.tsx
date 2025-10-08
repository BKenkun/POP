
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
    // Evita la redirección si ya estamos en la página de login
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Si está cargando o no está autenticado y no es la página de login, muestra el loader.
  if ((loading || !isAuthenticated) && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Si no está autenticado y es la página de login, devuelve null para que el layout de abajo se encargue.
  if (!isAuthenticated && pathname === '/admin/login') {
      return null;
  }


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
      {/* Si estamos en la página de login, no usamos el layout protegido. */}
      {pathname === '/admin/login' ? (
         <>
            {children}
            <Toaster />
        </>
      ) : (
        <>
            <AdminLayoutContent>{children}</AdminLayoutContent>
            <Toaster />
        </>
      )}
    </AdminAuthProvider>
  );
}
