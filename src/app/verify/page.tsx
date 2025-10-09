
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, ShieldAlert } from 'lucide-react';
import { login } from '@/app/actions/admin-auth';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            {pending ? 'Verificando...' : 'Acceder'}
        </Button>
    );
}

export default function VerifyPage() {
  const { toast } = useToast();
  // The login server action now handles redirection, but can return an error state.
  const [state, formAction] = useFormState(login, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <ShieldAlert className="h-10 w-10 mx-auto text-primary" />
          <CardTitle className="text-2xl font-bold">Verificación de Administrador</CardTitle>
          <CardDescription>Esta es una zona restringida. Por favor, identifícate.</CardDescription>
        </CardHeader>
        <form action={formAction}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email de Administrador</Label>
                    <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="admin@email.com" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                        id="password" 
                        name="password"
                        type="password" 
                        required 
                    />
                </div>
                {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
