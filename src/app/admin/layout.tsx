
import { ReactNode, Suspense } from 'react';
import { redirect } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/admin-sidebar";
import { Toaster } from '@/components/ui/toaster';
import ThemeToggleButton from './_components/theme-toggle-button';
import { ThemeProvider } from '@/context/theme-provider';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import { Loader2 } from 'lucide-react';


async function AdminAuthCheck() {
  const sessionCookie = cookies().get('admin_session')?.value;
  if (!sessionCookie) {
    redirect('/verify');
  }
  const session = await decrypt(sessionCookie);
  if (!session?.isAdmin) {
    redirect('/verify');
  }
  return null;
}


export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // Admin routes need their own ThemeProvider, separate from the client one
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
            <AdminAuthCheck />
        </Suspense>
        
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
