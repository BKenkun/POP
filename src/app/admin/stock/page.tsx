'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse } from "lucide-react";

export default function AdminStockPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Almacén</h1>
          <p className="text-muted-foreground">Controla el inventario de tus productos.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Warehouse className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Página en Construcción</CardTitle>
            <CardDescription>
                Esta sección para la gestión de stock está actualmente en desarrollo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Próximamente podrás ver informes de inventario, ajustar niveles de stock y más.</p>
        </CardContent>
      </Card>
    </div>
  );
}
