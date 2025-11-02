
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAdmin } = useAuth(); // We can get isAdmin from context now
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Create session cookie
      await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      const loggedInIsAdmin = userCredential.user.email === 'maryandpopper@gmail.com';
      
      toast({
          title: "Inicio de sesión exitoso",
          description: loggedInIsAdmin ? "¡Bienvenido, Administrador!" : "¡Bienvenido de nuevo!",
      });

      const redirectUrl = searchParams.get('redirect');

      if (loggedInIsAdmin) {
          router.push(redirectUrl && redirectUrl.startsWith('/admin') ? redirectUrl : '/admin');
      } else if (redirectUrl) {
          router.push(redirectUrl);
      } else {
          router.push('/account');
      }
      
      router.refresh(); 

    } catch (err: any) {
        let friendlyError = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
             friendlyError = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
        } else {
            console.error("Firebase Auth Error:", err);
        }
        setError(friendlyError);
        toast({
            title: 'Error al iniciar sesión',
            description: friendlyError,
            variant: 'destructive',
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email_label')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.password_label')}</Label>
                <Link href="/forgot-password" passHref tabIndex={-1}>
                    <Button variant="link" className="px-0 h-auto text-xs">
                        {t('auth.forgot_password_link')}
                    </Button>
                </Link>
            </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {loading ? t('auth.logging_in_button') : t('auth.login_button')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.no_account_prompt')}{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            {t('auth.register_link')}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
