
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginForm = dynamic(() => import('./login-form'), { ssr: false });

export default function AdminLoginPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // If done loading and user is already authenticated, redirect to dashboard.
    if (!loading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, loading, router]);


  // Don't render the form if we're authenticated, to avoid a flash of content.
  if (isAuthenticated) {
    return null; 
  }

  return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 animate-in fade-in duration-500">
          <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
              <LoginForm />
          </CardContent>
          </Card>
      </div>
  );
}
