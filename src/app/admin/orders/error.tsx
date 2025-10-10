
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
    // Registrar el error en un sistema de monitoreo (ej. Sentry, LogRocket, etc.)
    console.error("Error en el componente de pedidos:", error);
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
                    No hemos podido mostrar la lista de pedidos en este momento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground mb-6">
                    Puedes intentar recargar la página. Si el problema persiste, contacta con el soporte técnico.
                </p>
                <Button onClick={() => reset()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Intentar de nuevo
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
