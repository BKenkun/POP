'use client';

import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Providers } from "@/context/providers";

// Este es el layout principal para las páginas autenticadas del admin.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
