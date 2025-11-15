
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bitcoin } from "lucide-react";

export default function CryptoPosPage() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TPV de Criptomonedas</h1>
          <p className="text-muted-foreground">Acepta pagos en criptomonedas para ventas directas o sin conexión.</p>
        </div>
      </div>
      
      <Card className="flex-grow flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bitcoin className="h-6 w-6 text-primary"/>Terminal de Punto de Venta NOWPayments</CardTitle>
            <CardDescription>
                Este es tu terminal de venta personal. Introduce la cantidad en la moneda que prefieras y genera un código QR para que tu cliente pueda pagar.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <iframe
                src="https://nowpayments.io/pos-terminal/cmpppycbd"
                className="w-full h-full border-0 rounded-md"
                title="NOWPayments POS Terminal"
                sandbox="allow-scripts allow-same-origin allow-forms"
            ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
