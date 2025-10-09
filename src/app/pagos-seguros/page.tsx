
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, CreditCard, Lock, AlertTriangle, ChevronRight, Banknote, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PagosSegurosPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Pagos Seguros y Discretos</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Tu seguridad y privacidad son nuestra máxima prioridad. Aquí te explicamos cómo gestionamos tus transacciones.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary"/>
                    <span>Nuestra Filosofía de Pago</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Para ofrecerte una experiencia de compra sencilla y accesible, hemos optado por métodos de pago manuales. Esto nos permite mantener la máxima discreción y evitar las complejidades de las pasarelas de pago automáticas.
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600"/>Tu Información Está Protegida</h3>
                    <p className="text-sm text-muted-foreground">
                       Tus datos de pago nunca se almacenan en nuestros servidores. Las transacciones se gestionan fuera de línea (contra-entrega) o mediante plataformas seguras como la de tu banco, garantizando tu privacidad.
                    </p>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary"/>
                    <span>Métodos de Pago Aceptados</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">Ofrecemos varias opciones para tu comodidad:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Banknote className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Contra-entrega</h4>
                            <p className="text-sm text-muted-foreground">Paga en efectivo, con tarjeta o Bizum directamente al repartidor cuando recibas tu paquete.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Smartphone className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Pago Anticipado</h4>
                            <p className="text-sm text-muted-foreground">Realiza el pago por Bizum o transferencia bancaria. Recibirás las instrucciones por email al confirmar tu reserva.</p>
                        </div>
                    </div>
                </div>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Nota sobre la Discreción</AlertTitle>
                    <AlertDescription>
                        Para proteger tu privacidad, el concepto que aparecerá en tus movimientos bancarios o en el Bizum será genérico y no hará referencia a esta página web ni a los productos adquiridos.
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
