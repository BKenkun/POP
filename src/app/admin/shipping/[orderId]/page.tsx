
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function AdminShippingDetailPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Envío</h1>
          <p className="text-muted-foreground">Gestionando el envío para el pedido #{params.orderId.substring(params.orderId.length - 7)}</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Vista de Reparto en Construcción</CardTitle>
            <CardDescription>
                Esta sección para la gestión de la entrega está actualmente en desarrollo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Próximamente aquí podrás ver los detalles del paquete, cambiar su estado y registrar la firma de entrega.</p>
        </CardContent>
      </Card>
    </div>
  );
}
