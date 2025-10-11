
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useFirebaseAuth().auth;
  const firestore = useFirestore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component only fully renders on the client, avoiding hydration errors.
    setIsClient(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (!auth || !firestore) {
        setError("El servicio de autenticación no está listo. Inténtelo de nuevo en un momento.");
        setLoading(false);
        return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
          email: user.email,
          uid: user.uid,
          createdAt: serverTimestamp(),
          displayName: user.email?.split('@')[0] || 'Nuevo Usuario',
          loyaltyPoints: 0,
          isSubscribed: false,
      });

      // On success, redirect to a dedicated success page
      router.push('/register/success');

    } catch (err: any) {
      let friendlyError = 'Ocurrió un error durante el registro.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'Este email ya está registrado. Intenta iniciar sesión.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'La contraseña debe tener al menos 6 caracteres.';
      }
      setError(friendlyError);
      toast({
        title: 'Error en el registro',
        description: friendlyError,
        variant: 'destructive',
      });
      setLoading(false); // Only set loading to false on error
    }
  };

  // Render a placeholder or nothing until the component is mounted on the client
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para una experiencia de compra más rápida.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                        <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="pr-10"
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                        >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
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
                        <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Creando cuenta...' : 'Registrarse'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Inicia Sesión
                    </Link>
                </p>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
