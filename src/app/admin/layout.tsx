
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2, Menu, Clock, RefreshCw } from 'lucide-react';
import ThemeToggleButton from './_components/theme-toggle-button';
import AdminSidebar from './_components/admin-sidebar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { formatRemainingClock, IDLE_WARNING_WINDOW_MS } from '@/lib/session-timeout';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, sessionRemainingMs, extendSession } = useAuth();
  const router = useRouter();
  const { state: sidebarState } = useSidebar();

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

  const isSidebarCollapsed = sidebarState === 'collapsed';
  const isWarning = sessionRemainingMs <= IDLE_WARNING_WINDOW_MS;

  return (
    <div className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300",
        isSidebarCollapsed ? "lg:grid-cols-[56px_1fr]" : "lg:grid-cols-[280px_1fr]"
    )}>
      <div className={cn(
          "hidden border-r bg-background lg:block",
           isSidebarCollapsed && "overflow-hidden"
      )}>
        <AdminSidebar />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                <AdminSidebar />
            </SheetContent>
          </Sheet>
          <div className="flex w-full flex-1 items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void extendSession()}
              title="Click to reset the inactivity timer"
              className={cn(
                "h-8 gap-2 font-mono text-xs tabular-nums",
                isWarning
                  ? "border-amber-500/60 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                  : "text-muted-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Session: {formatRemainingClock(sessionRemainingMs)}</span>
              <RefreshCw className="h-3 w-3 opacity-70" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-6 md:gap-8 bg-muted/40 overflow-auto">
            {children}
        </main>
      </div>
       <ThemeToggleButton />
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SidebarProvider>
    )
}
