'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, ShieldAlert } from 'lucide-react';
import { login } from '@/app/actions/admin-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the form only renders on the client side,
    // avoiding hydration mismatches caused by browser extensions.
    setIsClient(true);
  }, []);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      toast({
        title: "Error de autenticación",
        description: result.error,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "Acceso concedido",
        description: "Redirigiendo al panel de administración...",
      });
      router.push('/admin');
    }
  };
  
  const FormSkeleton = () => (
    <>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <ShieldAlert className="h-10 w-10 mx-auto text-primary" />
          <CardTitle className="text-2xl font-bold">Verificación de Administrador</CardTitle>
          <CardDescription>Esta es una zona restringida. Por favor, identifícate.</CardDescription>
        </CardHeader>
        
        {!isClient ? (
          <FormSkeleton />
        ) : (
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email de Administrador</Label>
                        <Input 
                            id="email" 
                            name="email"
                            type="email" 
                            placeholder="admin@email.com" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input 
                            id="password" 
                            name="password"
                            type="password" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        {loading ? 'Verificando...' : 'Acceder'}
                    </Button>
                </CardFooter>
            </form>
        )}
      </Card>
    </div>
  );
}
