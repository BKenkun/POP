
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const legalInfo = [
    { label: 'Titular del Sitio Web:', value: 'MARY AND POPPER' },
    { label: 'ABN:', value: 'Australian Business Number (ABN) 37 588 057 135' },
    { label: 'Dirección:', value: 'U 2 58 MAIN ST, OSBORNE PARK WA 6017, AUSTRALIA' },
    { label: 'Contacto:', value: 'info@comprarcbdonline.com' },
    { label: 'Logística y Distribución:', value: 'Los pedidos se gestionan y envían desde Francia. Para cumplir con los máximos estándares regulatorios de la Unión Europea, solo se envían a países cuyo uso es legal.' },
];

export default function InformacionLegalPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Información Legal</CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="space-y-4">
                    {legalInfo.map((info) => (
                        <div key={info.label} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
                            <dt className="font-semibold text-foreground">{info.label}</dt>
                            <dd className="md:col-span-2 text-muted-foreground">{info.value}</dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Advertencia sobre el Uso</AlertTitle>
                <AlertDescription>
                    Venta para usos técnicos, cosméticos o aromáticos. El consumo humano y el uso recreativo están estrictamente prohibidos y son desaconsejados.
                </AlertDescription>
            </Alert>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Derecho de Cancelación</AlertTitle>
                <AlertDescription>
                    Nos reservamos el derecho a cancelar cualquier pedido si se realiza desde una ubicación cuya legalidad es cuestionable o si sospechamos que se omitirá un uso legal del producto.
                </AlertDescription>
            </Alert>
        </div>
    </div>
  );
}
