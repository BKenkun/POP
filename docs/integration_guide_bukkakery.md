# Guía de Integración: Pasarela de Pagos Hilow Global Services

Este documento describe los pasos técnicos para que tu tienda (el "Cliente") integre la pasarela de pago de Hilow.

## El Proceso: Configuración y Flujo de Pago

La integración consta de dos fases:

1.  **Fase de Configuración (un solo paso):** Intercambio de credenciales entre tú (el Cliente) y el administrador de Hilow.
2.  **Fase de Flujo de Pago (tres pasos por cada compra):**
    *   **Paso 1 (Backend):** Tu sistema crea un pedido en Hilow vía API para obtener una URL de pago.
    *   **Paso 2 (Frontend):** Tu sistema redirige al comprador a esa URL de pago.
    *   **Paso 3 (Backend):** Tu sistema recibe una confirmación segura (webhook) cuando el pago se ha completado. **Este es el paso más importante**.

---

## Fase 1: Configuración Inicial

Para poder comunicarte con la API de Hilow, necesitas dos "secretos". Debes pedírselos al administrador de Hilow:

1.  **API Key (`HILOW_API_KEY`):**
    *   **¿Qué es?** Es tu "llave" para hacer llamadas a la API de Hilow (como crear pedidos).
    *   **¿Qué hacer?** Guárdala en las variables de entorno de tu servidor con el nombre `HILOW_API_KEY`.

2.  **Webhook Secret (`HILOW_WEBHOOK_SECRET`):**
    *   **¿Qué es?** Es la "contraseña" que te permite verificar que las notificaciones de pago que recibes son auténticas y vienen de Hilow.
    *   **¿Qué hacer?** Guárdala en tus variables de entorno como `HILOW_WEBHOOK_SECRET`. Para que Hilow pueda enviarte notificaciones, primero debes crear un endpoint de webhook (ver Fase 2, Paso 3) y darle esa URL al administrador de Hilow.

---

## Fase 2: Flujo de Pago

### Paso 1: Crear el Pedido (Backend de tu Tienda)

Cuando tu comprador hace clic en "Pagar", tu servidor debe llamar a la API de Hilow para registrar el pedido.

**Acción:** Usa el código de ejemplo del archivo `/docs/bukkakery-create-order.ts`. Contiene la función `createHilowApiOrder` lista para usar. El cuerpo (`body`) de la solicitud que esta función envía a la API de Hilow debe ser un JSON con la siguiente estructura:

```json
{
  "storeId": "bukkakery.com",
  "internalOrderId": "BK-12345",
  "amountInCents": 2599,
  "productName": "Cesta de la compra",
  "isSubscription": false,
  "successUrl": "https://bukkakery.com/shop/checkout/success?order_id=BK-12345",
  "cancelUrl": "https://bukkakery.com/shop/cart"
}
```

**Ejemplo de cómo usar la función en tu backend:**

```typescript
// En tu lógica de backend para finalizar una compra...
import { createHilowApiOrder } from './path/to/bukkakery-create-order';

async function handleCheckout(cart) {
  const orderDetails = {
    yourInternalOrderId: cart.id, // 'BK-12345'
    amountInCents: cart.total,    // 2599 (en céntimos)
    productName: 'Cesta de la compra',
    isSubscription: false,
    yourStoreUrl: 'https://bukkakery.com' // La URL base de tu tienda
  };

  const result = await createHilowApiOrder(
    orderDetails.yourInternalOrderId,
    orderDetails.amountInCents,
    orderDetails.productName,
    orderDetails.isSubscription,
    orderDetails.yourStoreUrl
  );

  if (result.success) {
    // Devuelve result.checkoutUrl a tu frontend para la redirección.
    return { checkoutUrl: result.checkoutUrl };
  } else {
    // Maneja el error.
    console.error(result.message);
    return { error: 'No se pudo iniciar el pago.' };
  }
}
```

### Paso 2: Redirección al Pago (Frontend de tu Tienda)

Una vez que tu backend obtiene la `checkoutUrl` del paso anterior, tu frontend simplemente debe redirigir al usuario a esa URL.

```javascript
// En tu componente de React/Javascript del botón de pago

async function handlePayButtonClick() {
  // 1. Llama a tu propio backend, que ejecuta la lógica del Paso 1.
  const response = await fetch('/api/your-backend/create-payment');
  const data = await response.json();

  // 2. Redirige al cliente si la llamada fue exitosa.
  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl;
  } else {
    alert('No se pudo procesar el pago. Por favor, inténtelo de nuevo.');
  }
}
```

### Paso 3: Recibir la Confirmación (Webhook - La Fuente de Verdad)

Este es el mecanismo **crítico y más fiable** para confirmar pagos.

**Acción:**

1.  **Crea tu Endpoint:** En tu proyecto Next.js, crea el archivo `/app/api/webhooks/hilow/route.ts`.
2.  **Copia el Código:** **Copia el contenido completo** del archivo `/docs/bukkakery-webhook-handler.ts` y pégalo en tu nuevo `route.ts`. Este archivo contiene toda la lógica para verificar y procesar las notificaciones de Hilow.
3.  **Implementa tu Lógica:** Modifica la función `updateLocalOrder` dentro de ese archivo para que actualice tu propia base de datos cuando un pago sea exitoso.
4.  **Informa a Hilow:** Despliega tu aplicación y dale la URL pública de tu webhook (ej: `https://bukkakery.com/api/webhooks/hilow`) al administrador de Hilow para que la configure en tu panel.

---

### (Opcional) Mejora de UI: Escuchar en Tiempo Real en el Frontend

Para mejorar la experiencia del usuario, puedes mostrar una notificación instantánea en tu página de éxito de pago.

**Acción:** Usa el hook de React proporcionado en `/docs/bukkakery-listener-hook.ts`. Este hook se conecta de forma segura a Hilow y "escucha" el cambio de estado del pedido, permitiéndote mostrar un "toast" o un tick verde al instante. **Recuerda: esto es solo para la UI, no para la lógica de negocio.**

Si tienes alguna pregunta, no dudes en contactar al equipo de Hilow.
