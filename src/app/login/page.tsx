
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Dynamically import the form component with SSR turned off.
const LoginForm = dynamic(() => import('./login-form'), { 
  ssr: false,
});

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta para ver tus pedidos.</CardDescription>
        </CardHeader>
        {redirect && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Acceso Restringido</AlertTitle>
              <AlertDescription>
                Debes iniciar sesión para acceder a esta página.
              </AlertDescription>
            </Alert>
          </div>
        )}
        <LoginForm />
      </Card>
    </div>
  );
}
