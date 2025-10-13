
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function AdminAccountingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contabilidad</h1>
          <p className="text-muted-foreground">Analiza los beneficios, costes e impuestos de tu tienda.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Página en Construcción</CardTitle>
            <CardDescription>
                Esta sección para la gestión de la contabilidad está actualmente en desarrollo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Próximamente podrás ver informes detallados sobre beneficios, márgenes por producto y totales de IVA.</p>
        </CardContent>
      </Card>
    </div>
  );
}
