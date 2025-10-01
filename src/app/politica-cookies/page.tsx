
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, BarChart2, Megaphone, Settings, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Política de Cookies | Popper Online',
    description: 'Información sobre el uso de cookies en nuestra tienda. Conoce qué cookies utilizamos, para qué sirven y cómo puedes gestionarlas.',
};

export default function PoliticaCookiesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Política de Cookies</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                En Popper Online utilizamos cookies y tecnologías similares para mejorar tu experiencia, garantizar la seguridad y analizar el uso de nuestro sitio. Aquí te explicamos cómo y por qué.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>1. ¿Qué es una cookie?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
                <p>Una cookie es un pequeño archivo de texto que un sitio web almacena en tu ordenador o dispositivo móvil cuando lo visitas. Permite que el sitio recuerde tus acciones y preferencias (como inicio de sesión, idioma, tamaño de fuente y otras preferencias de visualización) durante un período de tiempo, para que no tengas que volver a introducirlas cada vez que regresas al sitio o navegas de una página a otra.</p>
                <p>También utilizamos `localStorage` y `sessionStorage` del navegador, que son tecnologías similares que nos permiten almacenar información sin depender únicamente de las cookies.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>2. ¿Qué tipos de cookies utilizamos?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><Shield className="h-6 w-6 text-primary"/></div>
                    <div>
                        <h3 className="font-bold text-foreground">Cookies Técnicas (Estrictamente Necesarias)</h3>
                        <p className="text-muted-foreground">Estas cookies son esenciales para que el sitio web funcione correctamente. No se pueden desactivar en nuestros sistemas. Se configuran en respuesta a acciones realizadas por ti, como iniciar sesión, añadir productos al carrito o completar formularios. Sin ellas, los servicios que has solicitado no pueden proporcionarse.</p>
                         <p className="text-sm text-foreground mt-2"><strong>Ejemplos:</strong> Cookies de sesión de usuario, cookies del carrito de compras, cookies de seguridad de Stripe.</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><BarChart2 className="h-6 w-6 text-primary"/></div>
                    <div>
                        <h3 className="font-bold text-foreground">Cookies de Análisis o Rendimiento</h3>
                        <p className="text-muted-foreground">Estas cookies nos permiten contar las visitas y fuentes de tráfico para poder medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y las menos populares, y a ver cómo los visitantes se mueven por el sitio. Toda la información que recogen estas cookies es agregada y, por lo tanto, anónima.</p>
                        <p className="text-sm text-foreground mt-2"><strong>Ejemplos:</strong> Usamos Microsoft Clarity para entender cómo interactúas con la web y mejorar la experiencia.</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1"><Megaphone className="h-6 w-6 text-primary"/></div>
                    <div>
                        <h3 className="font-bold text-foreground">Cookies de Marketing</h3>
                        <p className="text-muted-foreground">Estas cookies pueden ser establecidas a través de nuestro sitio por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para construir un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios. No almacenan directamente información personal, sino que se basan en la identificación única de tu navegador y dispositivo de Internet.</p>
                        <p className="text-sm text-foreground mt-2"><strong>Ejemplos:</strong> Cookies de Klaviyo para gestionar suscripciones a nuestro boletín y notificaciones.</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>3. Cómo gestionar tus preferencias de cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>Tienes el control total sobre tus cookies. Cuando visitas nuestro sitio por primera vez, te mostramos un banner donde puedes aceptar todas las cookies, rechazar las no esenciales o personalizar tus preferencias.</p>
                <p>Puedes cambiar de opinión en cualquier momento. Además, la mayoría de los navegadores web te permiten gestionar las cookies a través de la configuración del navegador. Puedes configurar tu navegador para que te notifique antes de aceptar cookies o puedes configurarlo para que las rechace directamente.</p>
                <p>Ten en cuenta que si eliges bloquear las cookies técnicas, es posible que algunas partes de nuestro sitio web no funcionen correctamente.</p>
            </CardContent>
        </Card>

        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    Explorar Catálogo
                </Link>
            </Button>
        </div>
    </div>
  );
}

