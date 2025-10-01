
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Info, Gavel, AlertTriangle, UserCheck, Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Información sobre Leather Cleaners | Popper Online',
    description: 'Guía sobre el uso correcto, la venta y la legalidad de nuestros productos vendidos como limpiadores de cuero (Leather Cleaners).',
};

export default function LeatherCleanersInfoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Leather Cleaners: Información Esencial</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Una guía clara sobre la finalidad, venta y uso de nuestros productos para garantizar una compra segura e informada.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary"/>
                    <span>Nuestra Filosofía: "Leather Cleaners"</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    En nuestra tienda, los productos conocidos coloquialmente como "poppers" se comercializan bajo su finalidad técnica y legal: <strong>Limpiadores de Cuero (Leather Cleaners)</strong>. Entendemos que muchos clientes conocen estos productos por su nombre popular, y nuestro marketing se orienta a facilitarles la búsqueda.
                </p>
                <p className="text-muted-foreground">
                    Sin embargo, nuestro objetivo es ser transparentes y rigurosos. Todos los productos líquidos que ofrecemos están específicamente diseñados y fabricados para la <strong>limpieza y acondicionamiento de prendas eróticas, juguetes y accesorios de cuero</strong>.
                </p>
                 <Alert>
                    <ShieldCheck className="h-4 w-4"/>
                    <AlertTitle>Calidad y Normativa Europea</AlertTitle>
                    <AlertDescription>
                        Nuestros productos se producen según las normativas europeas, garantizando su pureza y seguridad para los fines técnicos previstos. No son aptos ni están fabricados para el consumo humano.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Uso Recreativo Estrictamente Prohibido</AlertTitle>
            <AlertDescription>
                Nos distanciamos completamente del abuso de nuestros productos como afrodisíacos, productos para la estimulación sexual o cualquier otro uso inadecuado. La inhalación directa desde el frasco está prohibida. El consumo humano es peligroso y contraviene nuestras condiciones de venta.
            </AlertDescription>
        </Alert>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-primary"/>
                    <span>Su Compromiso y Responsabilidad como Cliente</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">Al realizar un pedido, usted confirma y acepta las siguientes condiciones:</p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                    <li>Declara ser <strong>mayor de 18 años</strong>.</li>
                    <li>Confirma que conoce el <strong>uso técnico y los posibles efectos secundarios</strong> del producto, y que se ha informado adecuadamente antes de la compra.</li>
                    <li>Ha leído y está de acuerdo con nuestras <Link href="/terminos-y-condiciones" className="text-primary hover:underline font-semibold">Condiciones Generales de Contratación</Link>.</li>
                    <li>Actúa como <strong>importador final</strong> del producto, asumiendo la responsabilidad sobre la legalidad del mismo en su país de destino y cualquier trámite o coste aduanero.</li>
                </ul>
                <p className="text-sm text-muted-foreground pt-2">
                   Usted libera de cualquier responsabilidad a la empresa titular, sus empleados y proveedores por daños resultantes del mal uso de nuestros artículos.
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-primary"/>
                    <span>Nuestra Política de Venta y Envío</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                    <Package className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold">Logística desde la Unión Europea</h4>
                        <p className="text-sm text-muted-foreground">Todos nuestros productos se envían desde Francia, dentro de la Unión Europea, garantizando una gestión logística eficiente y cumpliendo con la normativa del país de origen para la venta de estos productos técnicos.</p>
                    </div>
                </div>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Derecho de Cancelación y Responsabilidad de Importación</AlertTitle>
                    <AlertDescription className="space-y-2 mt-2">
                        <p>Nos reservamos el derecho a <strong>cancelar cualquier pedido</strong> si sospechamos que se le dará un uso indebido o si se destina a una ubicación donde su legalidad sea cuestionable.</p>
                        <p>El cliente, como <strong>importador final</strong>, es el único responsable de asegurar que el producto es legal en su país. Costes de aduana, aranceles o confiscaciones son responsabilidad exclusiva del cliente, sin derecho a reembolso.</p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

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
