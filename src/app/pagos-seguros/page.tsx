
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, CreditCard, Lock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export default function PagosSegurosPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Pagos 100% Seguros y Discretos</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Tu seguridad y privacidad son nuestra máxima prioridad. Aquí te explicamos cómo protegemos cada una de tus transacciones.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary"/>
                    <span>Nuestro Aliado en Seguridad: Stripe</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Para garantizar la máxima seguridad en cada compra, todas nuestras transacciones son procesadas a través de <a href="https://stripe.com/es" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">Stripe</a>, una de las plataformas de pago más grandes y seguras del mundo.
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600"/>Tu Información Está Protegida</h3>
                    <p className="text-sm text-muted-foreground">
                        Cuando realizas un pago, tus datos son encriptados y enviados directamente a los servidores seguros de Stripe mediante una conexión SSL. <strong>Nosotros nunca vemos, almacenamos ni tenemos acceso a los detalles de tu tarjeta de crédito o débito.</strong> Esto elimina cualquier riesgo y te ofrece total tranquilidad.
                    </p>
                </div>
                 <p className="text-sm text-muted-foreground font-medium text-center pt-4">
                    Al pagar, interactúas directamente con la pasarela de Stripe, no con nuestros servidores.
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary"/>
                    <span>Métodos de Pago y Discreción</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">Aceptamos las principales tarjetas de crédito y débito para tu comodidad:</p>
                <div className="flex items-center justify-center py-4">
                    <Image src="https://files.stripe.com/links/MDB8YWNjdF8xUzJCUVJQZlNVeTg1UXdCfGZsX3Rlc3RfRlZKajRkbTUzUWd4a0thUmzBTR3NlMDkwMEhmQzVLU0c1" alt="Visa, Mastercard, Amex" width={250} height={40} className="object-contain" />
                </div>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Nota sobre la Discreción</AlertTitle>
                    <AlertDescription>
                        Para proteger tu privacidad, el nombre que aparecerá en tu extracto bancario no hará referencia a esta página web ni a los productos adquiridos.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600"/>
                    <span>Nuestra Responsabilidad</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <Alert>
                    <AlertTitle>Descargo de Responsabilidad del Procesador de Pagos</AlertTitle>
                    <AlertDescription>
                        <p>Al utilizar un proveedor de pagos externo como Stripe, el procesamiento de tu pago está sujeto a los términos, condiciones y políticas de privacidad de dicha entidad. Si bien haremos todo lo posible para ayudarte a resolver cualquier problema, la responsabilidad final sobre la transacción de pago recae en el proveedor de servicios.</p>
                        <p className="mt-2">Si experimentas algún fallo durante el proceso de pago, te recomendamos contactar primero a tu entidad bancaria y luego a nuestro servicio de atención al cliente para que podamos asistirte.</p>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    </div>
  );
}
