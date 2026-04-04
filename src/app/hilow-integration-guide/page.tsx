'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Clipboard, FileCode, Workflow, Info, Send } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
const jsCode = `
document.addEventListener('DOMContentLoaded', function() {
  const checkoutButton = document.getElementById('checkout_button');
  const couponField = document.getElementById('coupon_code_field');
  if (!checkoutButton || !couponField) {
    console.error('No se encontraron los elementos necesarios para la integración de Hilow.');
    return;
  }
  checkoutButton.addEventListener('click', function(event) {
    
    // Obtenemos el valor del campo de cupón y lo pasamos a mayúsculas y sin espacios.
    const couponValue = couponField.value.trim().toUpperCase();
    // Comprobamos si el cupón es 'HILOW'.
    if (couponValue === 'HILOW') {
      
      // 1. Prevenir que el formulario se envíe de la manera tradicional.
      event.preventDefault();
      event.stopPropagation();
      
      // 2. Obtener el ID del pedido ÚNICO de su sistema.
      // Esta función es un EJEMPLO. Debe reemplazarla con su propia lógica
      // para obtener el ID del pedido actual.
      const orderId = getYourStoresCurrentOrderId(); // <--- IMPORTANTE: Implementar esta función.
      if (!orderId) {
        console.error('No se pudo obtener el ID del pedido para la redirección a Hilow.');
        alert('Hubo un problema al procesar el pago. Por favor, inténtelo de nuevo.');
        return;
      }
      
      // 3. Construir la URL de pago de Hilow.
      // Es CRÍTICO que el orderId esté prefijado con "CPO_".
      const hilowPaymentUrl = \`https://hilowglobal.com/pay/CPO_\${orderId}\`;
      
      // 4. Redirigir al cliente a la pasarela de Hilow.
      console.log(\`Redirigiendo a Hilow para el pedido CPO_\${orderId}\`);
      window.location.href = hilowPaymentUrl;
      
    }
    
    // Si el cupón no es 'HILOW', no hacemos nada y el flujo de pago normal continúa.
    
  });
});
/**
 * IMPORTANTE: Esta es una función de ejemplo que DEBE ser reemplazada.
 * Su lógica debe devolver el identificador único del pedido que se está
 * procesando en el momento de hacer clic.
 * 
 * @returns {string} El ID del pedido actual (ej: "12345", "ABC-987", etc.).
 */
function getYourStoresCurrentOrderId() {
  // EJEMPLO: Quizás está en un campo oculto del formulario,
  // en un objeto JavaScript global, o se debe obtener vía una llamada a su API.
  // const orderIdElement = document.getElementById('hidden_order_id');
  // if (orderIdElement) {
  //   return orderIdElement.value;
  // }
  
  // Para este ejemplo, devolvemos un valor estático.
  // En producción, esto DEBE ser dinámico.
  return 'ORDER_12345'; 
}
`;
const htmlCode = `
<input type="text" id="coupon_code_field" name="coupon_code" placeholder="Código de descuento">
<button id="checkout_button">Finalizar Compra</button>
`;
const CodeSnippet = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "¡Copiado!", description: "El código ha sido copiado al portapapeles." });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
      </Button>
      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
        <code className={`language-${language}`}>{code.trim()}</code>
      </pre>
    </div>
  );
};
export default function HilowIntegrationGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Guía de Integración: Hilow Global Services</h1>
        <p className="text-lg text-muted-foreground">Este documento describe los pasos técnicos para integrar nuestra pasarela de pago avanzada en <strong>comprarpopperonline.com</strong>.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Workflow />Objetivo de la Integración</CardTitle>
        </CardHeader>
        <CardContent>
          <p>La integración consiste en redirigir al cliente a nuestra página de pago segura y embebida en lugar de su checkout tradicional cuando se cumpla una condición específica: **el uso del código de cupón "HILOW"**.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Send />Flujo de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>El cliente añade productos a su carrito en <strong>comprarpopperonline.com</strong>.</li>
            <li>El cliente introduce el código de cupón **HILOW**.</li>
            <li>Su sistema debe detectar el uso de este código.</li>
            <li>Cuando el cliente haga clic en el botón "Finalizar Compra", su sistema debe prevenir la acción por defecto y redirigirlo a la URL de pago de Hilow.</li>
            <li>Nuestra plataforma se encarga del resto: procesa el pago y redirige al cliente de vuelta a su página de éxito.</li>
          </ol>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><FileCode />Implementación Técnica</CardTitle>
          <CardDescription>La lógica debe implementarse en el frontend de su aplicación, en el archivo JavaScript que gestiona el carrito y el botón de pago.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mt-4">Paso 1: Estructura HTML</h3>
          <p className="text-sm text-muted-foreground mb-2">Asegúrese de que el botón para finalizar la compra y el campo del cupón tengan identificadores (IDs) claros en su HTML.</p>
          <CodeSnippet code={htmlCode} language="html" />
          <Separator className="my-6" />
          <h3 className="font-semibold text-lg">Paso 2: Lógica JavaScript</h3>
          <p className="text-sm text-muted-foreground mb-2">Debe añadir un script que escuche el evento `click` en su botón de pago. El siguiente ejemplo deberá ser adaptado a la estructura específica de su sitio.</p>
          <CodeSnippet code={jsCode} language="javascript" />
        </CardContent>
      </Card>
      
      <Alert variant="default" className="border-green-500">
        <Info className="h-4 w-4 !text-green-600" />
        <AlertTitle className="text-green-700 dark:text-green-300">Verificación y Pruebas</AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-400">
          <p>Para verificar que la redirección funciona, puede usar un ID de pedido de prueba preconfigurado: <strong>TEST_ELEMENTS_123</strong>.</p>
          <p className="mt-2">Si su función `getYourStoresCurrentOrderId()` devuelve ese valor, al usar el cupón HILOW debería ser redirigido a:</p>
          <p className="font-mono bg-muted text-foreground p-2 rounded-md my-2 text-xs">https://hilowglobal.com/pay/CPO_TEST_ELEMENTS_123</p>
          <p>En esa página verá un formulario de pago de Stripe funcional, confirmando que su parte de la integración está correcta.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
