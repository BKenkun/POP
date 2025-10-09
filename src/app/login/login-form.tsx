'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/app/actions/admin-auth';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (formData: FormData) => {
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
        toast({
          title: 'Error al iniciar sesión',
          description: result.error,
          variant: 'destructive',
        });
      }
      // No need to handle success redirection here, the server action does it.
      // If there's an error, we should stop the loading spinner.
      setLoading(false);
    } catch (e: any) {
        // Catch errors that might be thrown by the redirect
        if (e.message.includes('NEXT_REDIRECT')) {
            // This is expected, do nothing.
        } else {
            setError('Ha ocurrido un error inesperado.');
            toast({
                title: 'Error',
                description: 'Ha ocurrido un error inesperado.',
                variant: 'destructive',
            });
            setLoading(false);
        }
    }
  };

  return (
    <form action={handleLogin}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
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
  );
}
