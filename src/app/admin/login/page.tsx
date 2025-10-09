'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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


  // While loading, show a spinner to prevent a flash of the login form if already authenticated.
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  // Don't render the form if we're authenticated, to avoid a flash of content while redirecting.
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
