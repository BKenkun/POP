'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminLoginAction } from '@/app/actions/admin-auth';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function AdminVerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await adminLoginAction({ email, password });

    if (result.success) {
        login(); // Set isAuthenticated to true
        toast({
            title: 'Verificación Correcta',
            description: 'Redirigiendo al portal de acceso...',
        });
        router.push('/admin/portal');
    } else {
        setError(result.error || 'Email o contraseña incorrectos.');
        toast({
            title: 'Verificación Fallida',
            description: result.error || 'Por favor, comprueba tus credenciales.',
            variant: 'destructive',
        });
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Confirmación de Administrador</CardTitle>
                <CardDescription>Confirma tu identidad para acceder al panel.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                        id="email" 
                        type="email" 
                        placeholder="admin@example.com" 
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
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <LogIn className="mr-2 h-4 w-4" />
                        {loading ? "Verificando..." : "Confirmar"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
