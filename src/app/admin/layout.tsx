
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import ThemeToggleButton from './_components/theme-toggle-button';
import AdminSidebar from './_components/admin-sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login page with a redirect-back URL
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        // If logged in but not an admin, redirect to the main account page
        router.push('/account');
      }
    }
  }, [user, isAdmin, loading, router]);

  // While loading authentication state, show a full-screen loader
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no user, or the user is not an admin, render nothing.
  // The useEffect above will handle the redirection.
  if (!user || !isAdmin) {
    return null;
  }

  // If user is an admin, render the admin layout
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <AdminSidebar />
      </aside>
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
      <ThemeToggleButton />
    </div>
  );
}
