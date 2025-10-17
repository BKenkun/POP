
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2, Menu } from 'lucide-react';
import ThemeToggleButton from './_components/theme-toggle-button';
import AdminSidebar from './_components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/account');
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <AdminSidebar />
      </aside>
      
      {/* Mobile Sidebar */}
       <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="sm:hidden fixed top-4 left-4 z-40">
           <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-background">
          <AdminSidebar />
        </SheetContent>
      </Sheet>


      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
      <ThemeToggleButton />
    </div>
  );
}
