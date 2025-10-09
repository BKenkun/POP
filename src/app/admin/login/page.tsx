
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
    // Si ha terminado de cargar y el usuario ya está autenticado, redirigir al panel.
    if (!loading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, loading, router]);


  // Mientras se carga, muestra un spinner para evitar un destello del formulario de login
  // si ya está autenticado.
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  // No renderizar el formulario si estamos autenticados, para evitar un destello de contenido
  // mientras se redirige.
  if (isAuthenticated) {
    return null; 
  }

  return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 animate-in fade-in duration-500">
          <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
              <CardTitle className="text-2xl">Login de Administrador</CardTitle>
              <CardDescription>Introduce tus credenciales para acceder al panel.</CardDescription>
          </CardHeader>
          <CardContent>
              <LoginForm />
          </CardContent>
          </Card>
      </div>
  );
}
