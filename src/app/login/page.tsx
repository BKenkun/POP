
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { adminLoginAction } from '../actions/admin-auth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginAsAdminCustomer } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Step 1: Attempt to log in as admin via the special client view
    try {
        const adminCheckResult = await adminLoginAction({ email, password });
        if (adminCheckResult.success) {
            loginAsAdminCustomer();
            toast({
                title: 'Inicio de sesión como administrador',
                description: 'Explorando la vista de cliente.',
            });
            router.push('/account');
            setLoading(false);
            return; // Important: exit the function if admin login is successful
        }
    } catch (serverActionError) {
        console.error("Error during admin check server action:", serverActionError);
        // We can let it fall through to regular login, but good to log this.
    }


    // Step 2: If admin login fails, proceed with standard Firebase authentication for regular users.
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Redirigiendo a tu panel de usuario...',
      });
      router.push('/account');
    } catch (err: any) {
      // This error message is for regular user login failure
      const errorMessage = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      toast({
        title: 'Error al iniciar sesión',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta para ver tus pedidos.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Regístrate
                    </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
