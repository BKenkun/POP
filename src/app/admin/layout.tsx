
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { getAdminSession } from '@/app/actions/admin-auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This check now happens on the server, in a Node.js environment.
  // It can access process.env and correctly decrypt the cookie.
  const session = await getAdminSession();
  if (!session?.isAdmin) {
    redirect('/verify');
  }

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
