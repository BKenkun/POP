
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import AccountSidebar from './_components/account-sidebar';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the loading is complete before checking for the user
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While loading, show a spinner to prevent premature redirection
  // and let the user know something is happening.
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
        <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Mi Cuenta</h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                Gestiona tu información personal, pedidos y direcciones.
            </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <AccountSidebar />
            </aside>
            <main className="md:col-span-3">
                 <Card>
                    <div className="p-6 md:p-8">
                        {children}
                    </div>
                </Card>
            </main>
        </div>
    </div>
  );
}
