
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Package, ShieldCheck, Info, ChevronRight, AlertTriangle, Truck, Rocket, Gavel } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const compositions = [
    {
        name: "Nitrito de Amilo",
        description: "Considerado uno de los más potentes, ofrece una acción de limpieza profunda y un aroma intenso. Ideal para un uso profesional por su alta pureza.",
        application: "Limpieza de cuero muy envejecido o curtido, ambientación de espacios grandes."
    },
    {
        name: "Nitrito de Propilo",
        description: "Más suaves y de acción rápida. Frecuentes en marcas de uso general. Buena opción para quienes buscan un resultado rápido y un aroma más ligero.",
        application: "Mantenimiento diario de cuero, limpieza de superficies delicadas."
    },
    {
        name: "Nitrito de Pentilo",
        description: "Famosos por la durabilidad de su efecto. Excelentes para fines donde se requiere un resultado sostenido y una evaporación más controlada.",
        application: "Limpieza de objetos de coleccionismo, uso en marroquinería de alta gama."
    }
];

export default function VentaPopperPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Venta de Popper: Calidad, Seguridad y Legislación</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Nuestra tienda en línea de referencia está dedicada a ofrecer Poppers de alta calidad para usos técnicos, cosméticos y aromáticos, garantizando que cada producto cumpla con la legislación vigente.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-6 w-6"/>
                    ¿Qué es el Popper y Cuáles son sus Usos Legales?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="font-semibold">Definición Detallada</h3>
                <p className="text-muted-foreground">
                    El término "popper" se refiere popularmente a los nitritos de alquilo (amilo, pentilo o propilo). Son compuestos químicos volátiles que en nuestra tienda se comercializan exclusivamente como <strong>limpiadores de cuero, solventes o ambientadores técnicos</strong>. Su función es la de un solvente y no están diseñados, ni deben usarse, para el consumo humano.
                </p>
                <h3 className="font-semibold">Usos Oficiales Permitidos (¡No Recreativos!)</h3>
                <p className="text-muted-foreground">
                   Para garantizar el cumplimiento de nuestras condiciones de venta, todos nuestros productos tienen las siguientes aplicaciones legales:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Uso Técnico/Ambientador:</strong> Para la limpieza profesional de superficies o cuero.</li>
                    <li><strong>Uso Cosmético/Aromaterapia:</strong> Como esencia para perfumería o ambientación.</li>
                    <li><strong>Coleccionismo:</strong> Para fines de estudio o colección.</li>
                </ul>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Advertencia Crucial: Uso Recreativo Prohibido</AlertTitle>
            <AlertDescription>
                Se prohíbe y desaconseja expresamente el consumo humano o el uso recreativo de cualquiera de nuestros productos. El incumplimiento de esta advertencia es responsabilidad exclusiva del cliente. Este uso contraviene nuestras Condiciones Generales de Venta y puede ser perjudicial para la salud.
            </AlertDescription>
        </Alert>

         <Card>
            <CardHeader>
                <CardTitle>Nuestra Variedad: Un Catálogo para Cada Necesidad Técnica</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Ponemos a su disposición una rigurosa selección de Poppers clasificados por su composición y finalidad técnica:</p>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variedad o Fórmula</TableHead>
                                <TableHead>Descripción Detallada</TableHead>
                                <TableHead>Aplicación Técnica Sugerida</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {compositions.map((comp) => (
                                <TableRow key={comp.name}>
                                    <TableCell className="font-medium">{comp.name}</TableCell>
                                    <TableCell>{comp.description}</TableCell>
                                    <TableCell>{comp.application}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Servicios de la Tienda: Confidencialidad y Eficiencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">Le garantizamos una experiencia de compra sencilla y segura, respaldada por nuestro compromiso con la discreción y la velocidad:</p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <Package className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">Envío Rápido y Totalmente Discreto</h4>
                            <p className="text-sm text-muted-foreground">Todos los productos se envían en un paquete sin referencias externas. Los pedidos pagados antes de las 12:00 en días hábiles se envían el mismo día.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">Legalidad y Logística</h4>
                            <p className="text-sm text-muted-foreground">Solo vendemos artículos que cumplen con la normativa. Su pedido se gestiona desde Francia para asegurar una logística eficiente en la UE.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Rocket className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold">Precios Competitivos</h4>
                            <p className="text-sm text-muted-foreground">Gracias a la relación directa con fabricantes, ofrecemos precios inmejorables, ofertas por volumen y paquetes de ahorro.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-6 w-6"/>
                    Legalidad, Envío y Responsabilidad del Cliente
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Nuestros productos se gestionan y envían desde Francia, donde la venta de poppers como limpiadores de cuero o ambientadores es legal. Esto nos permite asegurar una logística eficiente en la Unión Europea. Sin embargo, es fundamental que como cliente conozca sus responsabilidades.
                </p>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Advertencia sobre el Uso y la Responsabilidad de Importación</AlertTitle>
                    <AlertDescription className="space-y-2">
                        <p><strong>Uso Previsto:</strong> La venta de nuestros productos es exclusivamente para usos técnicos, cosméticos o aromáticos. El consumo humano y el uso recreativo están estrictamente prohibidos.</p>
                        <p><strong>Responsabilidad del Cliente como Importador:</strong> Usted, como cliente, actúa como el importador final del producto. Es su responsabilidad asegurarse de que el producto es legal en su país de destino. Cualquier coste de aduana, arancel, impuesto de importación, o la confiscación del paquete será asumido exclusivamente por usted, sin derecho a reembolso por nuestra parte.</p>
                        <p><strong>Derecho de Cancelación:</strong> Nos reservamos el derecho a cancelar cualquier pedido si tenemos sospechas de que se hará un uso indebido del producto o si se envía a una ubicación donde su legalidad sea cuestionable.</p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    Explorar Catálogo Completo
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
