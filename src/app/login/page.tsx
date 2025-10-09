
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Dynamically import the form component with SSR turned off.
const LoginForm = dynamic(() => import('./login-form'), { 
  ssr: false,
});

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta para ver tus pedidos.</CardDescription>
        </CardHeader>
        <LoginForm />
      </Card>
    </div>
  );
}
