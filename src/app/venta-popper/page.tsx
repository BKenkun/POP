
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VentaPopperPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Venta de Popper: Calidad y Discreción Garantizadas</h1>
            <p className="text-lg text-muted-foreground">Tu tienda de confianza para comprar poppers online en España.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>¿Por qué elegir Popper Online para la venta de popper?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>En Popper Online, nos especializamos en la <strong>venta de popper</strong> de la más alta calidad, asegurando que cada producto que ofrecemos cumple con los estándares más exigentes. Nuestro compromiso se basa en tres pilares fundamentales:</p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center">
                        <Package className="h-10 w-10 text-primary mb-2"/>
                        <h3 className="font-bold">Calidad Premium</h3>
                        <p className="text-sm text-muted-foreground">Solo trabajamos con las marcas más reconocidas y fórmulas puras para garantizar una experiencia superior.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <ShieldCheck className="h-10 w-10 text-primary mb-2"/>
                        <h3 className="font-bold">Compra Segura y Discreta</h3>
                        <p className="text-sm text-muted-foreground">Tu privacidad es nuestra prioridad. Ofrecemos pagos seguros y envíos en paquetes sin ninguna marca externa.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <ShoppingCart className="h-10 w-10 text-primary mb-2"/>
                        <h3 className="font-bold">Amplio Catálogo</h3>
                        <p className="text-sm text-muted-foreground">Desde los clásicos más vendidos hasta las últimas novedades, encuentra el aroma perfecto para ti en nuestra tienda.</p>
                    </div>
                </div>
                 <div className="text-center pt-4">
                    <Button asChild>
                        <Link href="/products">Explorar todos los productos</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <ShoppingCart className="h-4 w-4" />
            <AlertTitle>Uso Responsable</AlertTitle>
            <AlertDescription>
                Nuestros productos se venden exclusivamente como limpiadores de cuero, solventes o aromas. No son para consumo humano. El uso indebido es responsabilidad exclusiva del comprador. Debes ser mayor de 18 años para comprar.
            </AlertDescription>
        </Alert>
    </div>
  );
}
