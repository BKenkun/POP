
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { auth } = useFirebaseAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
        setError("Servicio de autenticación no disponible.");
        setLoading(false);
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await getIdToken(userCredential.user);

      // Send the token to the server to create session cookies
      const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
      });
      
      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.error || 'No se pudo crear la sesión del servidor.');
      }
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Redirigiendo...',
      });
      
      const redirectUrl = searchParams.get('redirect');
      const isAdmin = result.isAdmin;

      // Redirect user based on their role
      const targetUrl = isAdmin ? (redirectUrl || '/admin') : (redirectUrl || '/account');
      router.push(targetUrl);
      router.refresh();

    } catch (err: any) {
      let errorMessage = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          // Keep the generic message for security reasons
      } else {
          errorMessage = 'Ocurrió un error inesperado. Por favor, contacta con soporte.';
          console.error("Login Error:", err);
      }
      setError(errorMessage);
      toast({
        title: 'Error al iniciar sesión',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
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
            <div className="relative">
                <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
