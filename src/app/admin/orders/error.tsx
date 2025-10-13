
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to a monitoring system
    console.error("ErrorBoundary caught an error in admin orders:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-lg text-center border-destructive">
             <CardHeader>
                <div className="mx-auto bg-destructive/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle>¡Ups! Algo salió mal</CardTitle>
                <CardDescription>
                    No hemos podido procesar esta vista en este momento.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">
                    Esto puede ser un problema temporal. Puedes intentar recargar la página. Si el problema persiste, contacta con el soporte técnico.
                </p>
                <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 text-left text-xs text-secondary-foreground">
                  <code>{error.message}</code>
                </pre>
                <Button onClick={() => reset()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Intentar de nuevo
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

    