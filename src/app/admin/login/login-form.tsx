
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

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await adminLoginAction({ email, password });

    if (result.success) {
        login();
        toast({
            title: 'Login Successful',
            description: 'Redirecting to the admin dashboard...',
        });
        setIsSuccess(true);
        setTimeout(() => {
             router.push('/admin');
        }, 500); // Wait for fade-out animation
    } else {
        setError(result.error || 'Invalid email or password.');
        toast({
            title: 'Login Failed',
            description: result.error || 'Please check your credentials and try again.',
            variant: 'destructive',
        });
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className={`space-y-4 transition-opacity duration-500 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
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
        <Label htmlFor="password">Password</Label>
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
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}
