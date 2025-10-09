
'use client';

import { useAdminAuth } from '@/context/admin-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and user is not authenticated, redirect
    if (!loading && !isAuthenticated) {
      router.push('/admin/verify');
    }
  }, [isAuthenticated, loading, router]);

  // While loading, show a full-screen spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the children (the protected admin pages)
  if (isAuthenticated) {
      return <>{children}</>;
  }

  // If not authenticated and not loading, we're about to redirect, so show a spinner
  return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
  );
}
