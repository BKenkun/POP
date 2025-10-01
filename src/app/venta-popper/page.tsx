
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Package, ShieldCheck, Info, ChevronRight, AlertTriangle } from 'lucide-react';
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
                En MARY AND POPPER, nos dedicamos a ofrecer Poppers de alta calidad para usos técnicos, cosméticos y aromáticos, garantizando que cada producto cumpla con la legislación vigente.
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
                <p className="text-muted-foreground">
                    El término "popper" se refiere popularmente a los nitritos de alquilo (amilo, pentilo o propilo). Son compuestos químicos volátiles que en nuestra tienda se comercializan exclusivamente como <strong>limpiadores de cuero, solventes o ambientadores técnicos</strong>.
                </p>
                <p className="text-muted-foreground">
                   Su función es la de un solvente y no están diseñados, ni deben usarse, para el consumo humano. Los usos oficiales permitidos son:
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
            <AlertTitle>Advertencia Crucial: Uso Recreativo Estrictamente Prohibido</AlertTitle>
            <AlertDescription>
                MARY AND POPPER prohíbe y desaconseja expresamente el consumo humano o el uso recreativo de cualquiera de nuestros productos. El incumplimiento de esta advertencia es responsabilidad exclusiva del cliente y puede ser perjudicial para la salud.
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
                                <TableHead>Composición</TableHead>
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
