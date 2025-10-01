
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gavel, AlertTriangle, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Resolución de Contratos y Litigios | Popper Online',
    description: 'Información sobre el derecho de resolución, la ley aplicable y los procedimientos para la resolución de litigios en Popper Online.',
};

export default function ResolucionLitigiosPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Resolución de Contratos y Litigios</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Aquí encontrarás toda la información sobre tus derechos y los procedimientos a seguir en caso de que necesites resolver un contrato o gestionar un litigio.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/>
                    <span>Derecho de Libre Resolución</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>De acuerdo con el Decreto-Ley no. 24/2014 del 14 de febrero, tienes <strong>14 días naturales</strong> después de recibir tu pedido para proceder con la rescisión del contrato y la devolución de la mercancía. Para ello, debes comunicarnos tu decisión mediante una declaración inequívoca (por ejemplo, una carta o un correo electrónico a <a href="mailto:info@comprarpopperonline.com" className="text-primary font-semibold hover:underline">info@comprarpopperonline.com</a>).</p>
                <p>Una vez comunicada tu decisión, dispones de otros 14 días para devolver los productos. Es importante destacar que <strong>los costes de la devolución de los bienes corren íntegramente por tu cuenta.</strong></p>
                 <p>Debes conservar los bienes para poder devolverlos en condiciones de uso adecuadas. Para que una devolución sea aceptada, los productos deben retornarse <strong>perfectamente sellados, sin abrir, sin usar, con todos sus precintos de seguridad intactos y en su embalaje original.</strong> Eres responsable de cualquier depreciación del valor si la manipulación de los productos excede lo necesario para una inspección puramente visual de su naturaleza.</p>
                <p>Tras recibir la mercancía devuelta y comprobar su estado, te reembolsaremos todos los pagos recibidos, a excepción de los costes adicionales si elegiste un método de envío más caro que el estándar que ofrecemos. Nos reservamos el derecho a retener el reembolso hasta recibir los productos y verificar que cumplen las condiciones de devolución.</p>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Exclusión del Derecho de Resolución</AlertTitle>
            <AlertDescription>
                <p className="font-semibold mt-2">No se aceptarán devoluciones en las siguientes situaciones, de acuerdo con la ley:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Suministro de productos sellados que no pueden devolverse por razones de <strong>protección de la salud o de higiene</strong> y que han sido abiertos o desprecintados después de la entrega.</li>
                    <li>Suministro de productos como cosméticos, artículos de cuidado personal, <strong>ropa interior o cualquier producto de uso íntimo</strong> cuyo embalaje haya sido comprometido.</li>
                    <li>Grabaciones de audio/vídeo o software a los que se les haya quitado el sello de inviolabilidad.</li>
                    <li>El cliente, como <strong>importador final</strong>, es el único responsable de asegurar que el producto es legal en su país. Costes de aduana, aranceles o confiscaciones son responsabilidad exclusiva del cliente y esto no dará derecho a reembolso.</li>
                </ul>
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-6 w-6 text-primary"/>
                    <span>Ley Aplicable, Mediación y Jurisdicción</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>Este contrato se rige por la <strong>ley francesa</strong>. Para la resolución de cualquier disputa, la jurisdicción competente es la del <strong>Distrito de Perpiñán</strong>, con renuncia a cualquier otra.</p>
                
                <h3 className="font-bold text-foreground pt-4">Resolución Alternativa de Litigios (RAL)</h3>
                <p>En caso de litigio, puedes recurrir a una Entidad de Resolución Alternativa de Litigios de Consumo. La mediación es un proceso gratuito y confidencial para resolver desacuerdos de forma amistosa con la ayuda de un tercero imparcial.</p>
                <p>Para litigios de consumo en línea, puedes utilizar la plataforma ODR (Online Dispute Resolution) de la Unión Europea, que facilita la resolución de disputas transfronterizas.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                     <Button asChild variant="outline">
                        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/>
                            Plataforma ODR de la UE
                        </a>
                    </Button>
                    <Button asChild variant="outline">
                        <a href="https://www.mediation-conso.fr" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/>
                            Mediadores Oficiales (Francia)
                        </a>
                    </Button>
                </div>

                <h3 className="font-bold text-foreground pt-4">Pasos para la Mediación</h3>
                 <ol className="list-decimal list-inside space-y-2">
                    <li>Antes de cualquier mediación, debes enviarnos una queja por escrito (preferiblemente por correo electrónico para tener constancia).</li>
                    <li>Si no recibes una respuesta satisfactoria de nuestra parte en un plazo razonable, puedes iniciar el procedimiento de mediación a través de la web del mediador.</li>
                    <li>El mediador te informará de la recepción de tu expediente y dispondrá de 90 días para proponer una solución. Ambas partes son libres de aceptarla o rechazarla.</li>
                </ol>
                <p>Para cualquier queja o consulta inicial, puedes contactarnos en <a href="mailto:info@comprarpopperonline.com" className="text-primary font-semibold hover:underline">info@comprarpopperonline.com</a>.</p>

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
