
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { AdminAuthProvider } from '@/context/admin-auth-context';

const LoginForm = dynamic(() => import('./login-form'), { ssr: false });

export default function AdminLoginPage() {
  return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 animate-in fade-in duration-500">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* El AuthProvider ahora solo envuelve el formulario que lo necesita */}
            <AdminAuthProvider>
              <LoginForm />
            </AdminAuthProvider>
          </CardContent>
        </Card>
      </div>
  );
}
