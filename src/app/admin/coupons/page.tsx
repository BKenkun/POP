'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
          <p className="text-muted-foreground">Crea y administra códigos de descuento para tus clientes.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Ticket className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Página en Construcción</CardTitle>
            <CardDescription>
                Esta sección para la gestión de cupones de descuento está actualmente en desarrollo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Próximamente podrás crear cupones por porcentaje, por cantidad fija y más.</p>
        </CardContent>
      </Card>
    </div>
  );
}
