
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Database, BarChart2, Mail, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Privacidad y Protección de Datos | Popper Online',
    description: 'Conoce cómo protegemos y gestionamos tus datos personales en nuestra tienda. Tu seguridad y confianza son nuestra prioridad.',
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Política de Privacidad y Protección de Datos</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                En Popper Online, entendemos que el uso de tus datos personales requiere tu confianza. Estamos comprometidos con tu privacidad y solo utilizaremos tus datos para los fines que te explicamos a continuación.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/><span>Nuestro Compromiso</span></CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-4">
                <p>Esta política de privacidad está diseñada para ayudarte a entender qué información recopilamos, por qué la recopilamos y cómo puedes gestionarla. Estamos sujetos a las normas más estrictas y solo utilizaremos tus datos personales para fines claramente identificados y de acuerdo con tus derechos.</p>
                <p>Dado que las leyes sobre tecnología y protección de datos están en constante evolución, esta Política puede ser actualizada. Al usar nuestro sitio, aceptas esta política. Todos los datos se conservarán durante el período legalmente exigido, respetando las garantías de confidencialidad del RGPD (Reglamento General de Protección de Datos).</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>1. ¿Quién es el responsable del tratamiento de tus datos?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
                <p>El responsable del tratamiento de tus datos es <strong>MARY AND POPPER</strong> (ABN 37 588 057 135), con domicilio en U 2 58 MAIN ST, OSBORNE PARK WA 6017, AUSTRALIA. Puedes contactarnos en cualquier momento en: <a href="mailto:info@comprarpopperonline.com" className="text-primary font-semibold hover:underline">info@comprarpopperonline.com</a>.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>2. ¿Qué datos recogemos de ti?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
                <p>Dependiendo de tu interacción con nosotros, podemos recoger:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Datos de Identificación y Cuenta:</strong> Nombre, email, contraseña, fecha de nacimiento, número de teléfono.</li>
                    <li><strong>Datos para Pedidos:</strong> Dirección de envío, NIF y datos de facturación.</li>
                    <li><strong>Historial de Cliente:</strong> Compras realizadas, estado de pedidos, carritos abandonados, quejas, etc.</li>
                    <li><strong>Datos de Navegación:</strong> Dirección IP, navegador, sistema operativo y páginas visitadas. Usamos <strong>Microsoft Clarity</strong> para entender cómo interactúas con la web (clics, scroll) y mejorar tu experiencia.</li>
                </ul>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>3. ¿Para qué se utilizan tus datos?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
                <p><strong>Compra y gestión de pedidos:</strong> Para procesar tus compras, gestionar envíos, facturación y pagos.</p>
                <p><strong>Atención al cliente:</strong> Para responder a tus consultas y ayudarte con cualquier necesidad.</p>
                <p><strong>Envío de boletines (Marketing):</strong> Con tu consentimiento, te enviamos promociones y novedades a través de nuestro proveedor <strong>Klaviyo</strong>.</p>
                <p><strong>Elaboración de perfiles:</strong> Analizamos hábitos de consumo de forma agregada para mejorar nuestros productos y personalizar ofertas, siempre respetando tu privacidad.</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>4. ¿Compartimos tus datos con terceros?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
                <p>Para poder ofrecerte nuestros servicios, necesitamos compartir tus datos con socios de confianza, siempre con la máxima seguridad y solo la información estrictamente necesaria:</p>
                 <div className="space-y-4">
                    <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertTitle>Procesadores de Pago (Stripe)</AlertTitle>
                        <AlertDescription>
                            Tus datos de pago (tarjeta de crédito/débito) se envían de forma encriptada directamente a <strong>Stripe</strong>. Nosotros nunca vemos ni almacenamos esta información sensible.
                        </AlertDescription>
                    </Alert>
                     <Alert>
                        <Mail className="h-4 w-4" />
                        <AlertTitle>Marketing y Comunicaciones (Klaviyo)</AlertTitle>
                        <AlertDescription>
                            Si te suscribes a nuestro boletín, tu email se gestiona a través de <strong>Klaviyo</strong> para el envío de comunicaciones.
                        </AlertDescription>
                    </Alert>
                     <Alert>
                        <Database className="h-4 w-4" />
                        <AlertTitle>Infraestructura y Base de Datos (Firebase)</AlertTitle>
                        <AlertDescription>
                            Los datos de tu cuenta (perfil, pedidos, direcciones) se almacenan de forma segura en <strong>Firebase</strong>, la plataforma de Google que usamos para el funcionamiento de la aplicación.
                        </AlertDescription>
                    </Alert>
                     <Alert>
                        <BarChart2 className="h-4 w-4" />
                        <AlertTitle>Análisis de Uso (Microsoft Clarity)</AlertTitle>
                        <AlertDescription>
                           Compartimos datos de interacción anónimos con <strong>Microsoft Clarity</strong> para analizar el uso de la web y mejorarla.
                        </AlertDescription>
                    </Alert>
                </div>
                 <p className="pt-4">Además, compartimos datos con empresas de logística para poder entregarte tus pedidos.</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>5. ¿Cuáles son tus derechos?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
                <p>Tienes derecho a:</p>
                 <ul className="list-disc list-inside space-y-1">
                    <li><strong>Acceder</strong> a tus datos y obtener una copia de los mismos.</li>
                    <li><strong>Rectificar</strong> tus datos si son incorrectos o están incompletos.</li>
                    <li><strong>Suprimir</strong> tus datos cuando ya no sean necesarios.</li>
                    <li><strong>Limitar</strong> el tratamiento de tus datos en determinadas circunstancias.</li>
                    <li><strong>Oponerte</strong> al tratamiento de tus datos para fines de marketing.</li>
                    <li>Solicitar la <strong>portabilidad</strong> de tus datos.</li>
                </ul>
                 <p className="pt-2">Puedes ejercer estos derechos en cualquier momento contactándonos en <a href="mailto:info@comprarpopperonline.com" className="text-primary font-semibold hover:underline">info@comprarpopperonline.com</a>.</p>
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
