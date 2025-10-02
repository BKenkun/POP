
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TerminosYCondicionesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Términos y Condiciones Generales</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 space-y-4">
                <p>
                    Bienvenido a www.comprarpopperonline.com. Le pedimos que lea atentamente las Condiciones Generales, nuestra Política de Cookies y nuestra Política de Privacidad, ya que éstas regulan su acceso y uso de este sitio.
                </p>
                <p>
                    Tanto el uso como las ventas realizadas a través de la tienda online suponen la aceptación por parte del Cliente de los Términos y Condiciones, nuestra Política de Cookies y nuestra Política de Privacidad que se establecen en cumplimiento de la legislación aplicable.
                </p>

                <h3 className="font-bold text-lg text-foreground">1. Partes implicadas</h3>
                <p><strong>1.1. Identificación del Vendedor:</strong> La venta de productos a través de este sitio web es realizada por la entidad registrada bajo la marca comercial MARY AND POPPER (ABN 37 588 057 135), con domicilio social en U 2 58 MAIN ST, OSBORNE PARK WA 6017, AUSTRALIA. Esta entidad opera como Vendedor a consumidores mayores de 18 años.</p>
                <p><strong>1.2. Logística y Suministro:</strong> Las presentes Condiciones regulan la compra de productos, cuya gestión logística y expedición (fulfillment) se realiza a través de un socio colaborador con sede en Francia. El Vendedor no es responsable del suministro de bienes o servicios por parte de entidades distintas al Vendedor o su socio logístico.</p>
                <p><strong>1.3.</strong> La información o los datos personales facilitados serán tratados de acuerdo con nuestra Política de Privacidad. Al utilizar este sitio, usted acepta el tratamiento de la información y los datos y declara que toda la información y los datos proporcionados son verdaderos y exactos.</p>
                <p><strong>1.4.</strong> El Cliente se identificará a través de los datos facilitados en el Pedido. Está prohibido proporcionar datos falsos y/o inventados: el Vendedor queda exento de cualquier responsabilidad al respecto.</p>

                <h3 className="font-bold text-lg text-foreground">2. Alcance del contrato</h3>
                <p>La información a la que se refieren las presentes Condiciones Generales en línea y los datos contenidos en el Sitio Web no constituyen una oferta al público, sino una invitación a realizar un Pedido. Tras el envío de la Propuesta de Pedido, el Cliente recibirá un correo electrónico de confirmación de recepción ("Confirmación de Pedido"). Este correo electrónico no constituye la aceptación del Pedido, que sólo se considerará aceptado cuando el Cliente reciba un correo electrónico confirmando que el Pedido ha sido aceptado y que el Pago ha sido aceptado ("Pago Aceptado"). El contrato de compra en línea ("Contrato") sólo se considerará concluido cuando el Cliente reciba la Confirmación de Pedido y Envío.</p>

                <h3 className="font-bold text-lg text-foreground">3. Precio</h3>
                <p>Los precios que figuran en el catálogo de este sitio web incluyen el IVA al tipo legal vigente y pueden variar sin previo aviso. Es responsabilidad del Vendedor comprobar la exactitud de los Precios antes de enviar la Confirmación de Pedido. En caso de error, el Cliente será contactado para confirmar si desea proceder con el precio correcto o cancelar el pedido. Los pagos se realizan siempre en euros (€).</p>

                <h3 className="font-bold text-lg text-foreground">4. Métodos de Pago</h3>
                <p>El Vendedor utiliza servicios de pago seguros y certificados. Toda la información personal de pago es encriptada mediante una conexión SSL (Secure Sockets Layer). El Vendedor no almacena ni tiene acceso a los datos sensibles de las tarjetas de crédito o débito del Cliente. Al utilizar un proveedor de servicios de pago externo, el Cliente acepta que el procesamiento de su pago estará sujeto a los términos, condiciones y políticas de privacidad de dicho proveedor, y que cualquier responsabilidad relacionada con la transacción de pago recae sobre esa entidad. Aceptamos pagos a través de Tarjeta de crédito/débito (Visa, Mastercard, Amex) y Transferencia Bancaria.</p>

                <h3 className="font-bold text-lg text-foreground">5. Pedidos y Envíos</h3>
                <p>Los pedidos pagados antes de las 12:00 (hora española) en día hábil (de lunes a viernes, exceptuando festivos nacionales y locales de Francia) se envían generalmente el mismo día. Los productos se envían en un paquete discreto sin referencias al contenido. En caso de falta de stock, contactaremos al cliente para ofrecer una solución. Los plazos de entrega son indicativos y pueden variar.</p>

                <h3 className="font-bold text-lg text-foreground">6. Cambios, Devoluciones y Anulaciones</h3>
                <p>El cliente dispone de 14 DÍAS NATURALES desde la recepción para solicitar un cambio o devolución, siempre que los productos no hayan sido utilizados, lavados o dañados y conserven su embalaje original. Para ejercer este derecho, debe contactar con nuestro Servicio de Atención al Cliente.</p>

                <h3 className="font-bold text-lg text-foreground">9. Información Adicional y Advertencias de Producto</h3>
                <p><strong>9.1. Usos Permitidos y Advertencia Sanitaria:</strong> El Cliente acepta que la finalidad de los productos vendidos por MARY AND POPPER es estrictamente para usos técnicos, cosméticos, o aromáticos externos. El Cliente se compromete a no ingerir, inhalar con fines recreativos, inyectar, o aplicar en mucosas o heridas cualquiera de los productos. El Vendedor queda exento de cualquier responsabilidad por daños a la salud derivados del incumplimiento de esta advertencia o de un uso distinto al declarado.</p>
                <p><strong>9.2.</strong> La información y servicios proporcionados en este sitio son solo con fines informativos y no sustituyen el consejo de un profesional de la salud. Consulte siempre a su médico o farmacéutico antes de utilizar cualquier producto.</p>

                <h3 className="font-bold text-lg text-foreground">11. Legalidad y Conformidad del Cliente</h3>
                <p><strong>11.1. Riesgo y Responsabilidad de la Importación:</strong> El Cliente actúa como IMPORTADOR FINAL de los productos. El Vendedor no garantiza la legalidad del producto en el país de destino. Cualquier coste aduanero, arancel, impuesto de importación, o la confiscación del paquete por parte de autoridades locales será asumido única y exclusivamente por el Cliente, sin derecho a reembolso del Vendedor.</p>
                <p><strong>11.2. Confirmación del Cliente:</strong> Al realizar un pedido usted confirma tener como mínimo 18 años de edad. Usted conoce el uso y los posibles efectos secundarios del producto, y antes de adquirirlo se ha informado adecuadamente. Usted libera de cualquier responsabilidad a MARY AND POPPER, sus empleados, proveedores y todas las personas asociadas por daños resultantes del mal uso de nuestros artículos.</p>
                
                <h3 className="font-bold text-lg text-foreground">12. Derecho de Desistimiento y Plazo Legal (UE)</h3>
                <p>De acuerdo con la normativa europea aplicable a la Ley Francesa, el consumidor dispone de 14 DÍAS NATURALES desde la recepción de los bienes para ejercer el derecho de desistimiento del contrato. Para ello, debe comunicar a MARY AND POPPER su decisión mediante una declaración inequívoca. Los gastos de devolución corren por cuenta del consumidor. El derecho de desistimiento no se aplica, bajo ninguna circunstancia, al suministro de productos precintados que no sean aptos para ser devueltos por razones de protección de la salud o de higiene si han sido desprecintados tras la entrega. Esto incluye expresamente los aceites, flores, e-líquidos, o cualquier producto de CBD/aromático cuyo envase o sellado de seguridad haya sido abierto o manipulado.</p>

                <h3 className="font-bold text-lg text-foreground">14. Ley Aplicable, Resolución de Conflictos y Jurisdicción</h3>
                <p><strong>14.1. Ley Aplicable:</strong> Este contrato se rige, en primer lugar, por la Ley Francesa, en virtud de la ubicación de expedición de los bienes, y de forma supletoria, por la legislación de Australia.</p>
                <p><strong>14.2. Jurisdicción:</strong> Para la resolución de cualquier disputa, la jurisdicción del Distrito de Perpiñan es competente, con renuncia a cualquier otra.</p>

                <h3 className="font-bold text-lg text-foreground">15. Contactos</h3>
                <p>
                    MARY AND POPPER (ABN 37 588 057 135)<br/>
                    U 2 58 MAIN ST<br/>
                    OSBORNE PARK WA 6017<br/>
                    AUSTRALIA<br/>
                    Contacto para Quejas/Soporte: info@comprarpopperonline.com<br/>
                    Contacto para Notificaciones Legales (Ejercicios de Desistimiento, etc.): Cualquier comunicación de naturaleza legal o ejercicio de derechos contractuales deberá realizarse por correo electrónico al contacto de soporte e, idealmente, ser respaldada mediante correo postal certificado a la dirección registrada en Australia.
                </p>

                <h3 className="font-bold text-lg text-foreground">16. Nulidad Parcial</h3>
                <p>Si alguna cláusula de las presentes Condiciones fuese declarada nula o inaplicable por una autoridad competente o tribunal, la validez del resto de las cláusulas no se verá afectada, manteniéndose el Contrato en vigor en sus demás términos. El Vendedor se compromete a sustituir la cláusula nula o inaplicable por otra de efecto legal y económico equivalente.</p>
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
