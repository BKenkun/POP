
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Truck, AlertTriangle, Globe, Package, ChevronRight, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
    title: 'Envío y Tarifas | Popper Online',
    description: 'Información detallada sobre nuestras políticas de envío, tarifas y plazos de entrega para España, Europa y el resto del mundo.',
};

const domesticCarriers = [
    { name: 'Chrono Express', price: '7,90 €', time: '24 / 48 horas laborales' },
    { name: 'Colissimo (Correos Express)', price: '7,50 €', time: 'Mínimo 3 / 4 días laborales' },
];

const pickupPoints = [
     { name: 'Seur', price: '7,90 €', time: '48 / 72 horas laborales' },
];

const internationalCarriers = [
    { name: 'Chrono Express', price: '10,90 €', time: '2-4 días laborales' },
    { name: 'Colissimo (Correos Express)', price: '7,50 €', time: 'Mínimo 4 / 5 días laborales' },
];

const worldZones = [
    { zone: 'ÁFRICA', price: '32 €' },
    { zone: 'ASIA', price: '32 €' },
    { zone: 'AMÉRICA CENTRAL', price: '32 €' },
    { zone: 'AMÉRICA DEL NORTE', price: '28 €' },
    { zone: 'AMÉRICA DEL SUR', price: '32 €' },
    { zone: 'EUROPA (FUERA DE LA UE)', price: '28 €' },
    { zone: 'OCEANÍA', price: '32 €' },
    { zone: 'REINO UNIDO', price: '16 €' },
];

// Esta página detalla la política de envíos y sus tarifas.
export default function EnvioTarifasPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Envío y Tarifas</h1>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                En Popper Online nos esforzamos para que recibas tu pedido lo antes posible, con la máxima discreción y seguridad.
            </p>
        </header>

        <section aria-labelledby="shipping-policy">
            <Card>
                <CardHeader>
                    <CardTitle id="shipping-policy" className="flex items-center gap-3"><Truck className="h-6 w-6"/>Envío de tu Paquete</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>Hacemos todo lo posible para que recibas tu pedido rápidamente. Ten en cuenta los siguientes puntos:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Los pedidos realizados <strong>antes de las 12:00h</strong> se expiden el mismo día (excepto en periodos promocionales, festivos en Francia o alto volumen de pedidos).</li>
                        <li>Todos los pedidos se envían en un plazo de <strong>24 horas laborables</strong> (L-V), excluyendo festivos.</li>
                        <li>Nuestros envíos son siempre <strong>discretos y anónimos</strong>, sin ninguna referencia al contenido o a nuestra tienda en el exterior del paquete.</li>
                    </ul>
                </CardContent>
            </Card>
        </section>

        <div className="space-y-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Aviso Importante Sobre las Tarifas</AlertTitle>
                <AlertDescription>
                    Las tarifas y transportistas que se muestran a continuación son <strong>orientativos</strong> y se basan en nuestros socios logísticos de referencia. El coste final del envío se calculará durante el proceso de pago y puede variar según las condiciones específicas del transportista en el momento de la compra.
                </AlertDescription>
            </Alert>
            
            <section aria-labelledby="shipping-rates">
                 <Card>
                    <CardHeader>
                         <CardTitle id="shipping-rates" className="flex items-center gap-3"><MapPin className="h-6 w-6"/>Tarifas de Envío</CardTitle>
                        <CardDescription>Gratis a partir de 39€ para Península Ibérica, Francia, Portugal, Alemania, Italia, Bélgica, Luxemburgo y Países Bajos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-2">España (Península), Francia, Portugal, Alemania, Italia, etc.</h3>
                            <p className="text-sm text-muted-foreground mb-4">Envío a domicilio:</p>
                            <Table>
                                <TableHeader><TableRow><TableHead>Transportista</TableHead><TableHead>Tarifa</TableHead><TableHead>Plazo de Entrega</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {domesticCarriers.map(c => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.price}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                             <p className="text-sm text-muted-foreground mt-6 mb-4">A puntos de recogida:</p>
                            <Table>
                                 <TableHeader><TableRow><TableHead>Transportista</TableHead><TableHead>Tarifa</TableHead><TableHead>Plazo de Entrega</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pickupPoints.map(c => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.price}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-foreground mb-2">Islas Baleares, Canarias, Ceuta y Melilla</h3>
                            <p className="text-sm text-muted-foreground mb-4">Plazos sujetos a procedimientos aduaneros.</p>
                            <Table>
                                <TableHeader><TableRow><TableHead>Transportista</TableHead><TableHead>Tarifa</TableHead><TableHead>Plazo Estimado</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    <TableRow><TableCell>Colissimo (Correos)</TableCell><TableCell>18€</TableCell><TableCell>Mínimo 6-8 días laborales</TableCell></TableRow>
                                    <TableRow><TableCell>Chrono Express</TableCell><TableCell>32€</TableCell><TableCell>Mínimo 3-4 días laborales</TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg text-foreground mb-2">Resto de Europa</h3>
                            <p className="text-sm text-muted-foreground mb-4">A domicilio y puntos de recogida.</p>
                            <Table>
                                <TableHeader><TableRow><TableHead>Transportista</TableHead><TableHead>Tarifa</TableHead><TableHead>Plazo Estimado</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {internationalCarriers.map(c => <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.price}</TableCell><TableCell>{c.time}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section aria-labelledby="worldwide-shipping">
                <Card>
                    <CardHeader>
                        <CardTitle id="worldwide-shipping" className="flex items-center gap-3"><Globe className="h-6 w-6"/>Envíos al Resto del Mundo</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Table>
                             <TableHeader><TableRow><TableHead>Zona</TableHead><TableHead className="text-right">Tarifa (a domicilio con Chrono Express)</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {worldZones.map(z => <TableRow key={z.zone}><TableCell>{z.zone}</TableCell><TableCell className="text-right">{z.price}</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                     </CardContent>
                </Card>
            </section>
        </div>

        <section aria-labelledby="additional-info">
             <Card>
                <CardHeader>
                    <CardTitle id="additional-info">Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Package className="h-4 w-4" />
                        <AlertTitle>Seguimiento y Aviso de Entrega</AlertTitle>
                        <AlertDescription>
                            Recibirás un email con el número de seguimiento cuando tu pedido sea enviado. Si no estás en casa, el transportista dejará un aviso para organizar una nueva entrega o indicará el punto de recogida más cercano.
                        </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                         <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Envíos Internacionales y Aduanas</AlertTitle>
                        <AlertDescription>
                            Para pedidos fuera de la UE, es posible que se apliquen costes aduaneros. <strong>Popper Online no se hace responsable de estas tarifas, impuestos o derechos adicionales</strong>. Como cliente, actúas como importador y asumes la responsabilidad de estos costes.
                        </AlertDescription>
                    </Alert>
                     <p className="text-sm text-muted-foreground pt-2">
                        <strong>Atención:</strong> Los plazos son indicativos y dependen del transportista. Direcciones incorrectas o causas de fuerza mayor (huelgas, etc.) pueden causar retrasos. Los costes de reenvío por dirección incorrecta o no recogida del paquete correrán a cargo del cliente.
                    </p>
                </CardContent>
            </Card>
        </section>

         <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    Explorar Catálogo
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
