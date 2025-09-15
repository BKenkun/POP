
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminLoginAction } from '@/app/actions/admin-auth';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await adminLoginAction({ email, password });

    if (result.success) {
        toast({
            title: 'Login Successful',
            description: 'Redirecting to the admin dashboard...',
        });
        router.push('/admin');
    } else {
        setError(result.error || 'Invalid email or password.');
        toast({
            title: 'Login Failed',
            description: result.error || 'Please check your credentials and try again.',
            variant: 'destructive',
        });
    }
  };

  return (
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
        />
      </div>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
      <Button type="submit" className="w-full">
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
    </form>
  );
}
