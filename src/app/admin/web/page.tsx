'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function AdminWebPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personalización de la Web</h1>
          <p className="text-muted-foreground">Modifica la apariencia y el contenido de tu tienda online.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Página en Construcción</CardTitle>
            <CardDescription>
                Esta sección para la personalización de la web está actualmente en desarrollo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Próximamente podrás cambiar colores, logos, banners y gestionar las páginas estáticas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
