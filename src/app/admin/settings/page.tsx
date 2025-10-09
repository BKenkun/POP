'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración General</h1>
          <p className="text-muted-foreground">Ajusta los parámetros de tu tienda.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Página en Construcción</CardTitle>
            <CardDescription>
                Esta sección de configuración general está actualmente en desarrollo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Próximamente podrás gestionar la información de la tienda, integraciones y más.</p>
        </CardContent>
      </Card>
    </div>
  );
}
