'use server';

/**
 * @fileoverview PLANTILLA DE INTEGRACIÓN (V1.0 FINAL)
 * Contiene la lógica del backend del CLIENTE (ej. Bukkakery) para crear un pedido en Hilow.
 */

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Crea un pedido a través del endpoint de API seguro de Hilow.
 * 
 * @param yourInternalOrderId El ID del pedido en TU base de datos.
 * @param amountInCents El importe total en céntimos (ej: 2500 para 25.00€).
 * @param productName Nombre descriptivo del producto.
 * @param isSubscription true para activar pagos recurrentes automáticos.
 * @param yourStoreUrl La URL base de tu tienda (ej: "https://bukkakery.com").
 */
export async function createHilowApiOrder(
    yourInternalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean,
    yourStoreUrl: string 
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    try {
        const url = new URL(yourStoreUrl);
        const storeId = url.hostname; // Extrae el dominio (ej: bukkakery.com)

        // URL absoluta de la plataforma Hilow Global
        const HILOW_API_ENDPOINT = 'https://hilowglobal.com/api/orders';

        const payload = {
            storeId: storeId,
            internalOrderId: yourInternalOrderId,
            amountInCents: amountInCents,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: `${yourStoreUrl}/checkout/success?order_id=${yourInternalOrderId}`,
            cancelUrl: `${yourStoreUrl}/products`,
        };

        const HILOW_API_KEY = process.env.HILOW_API_KEY; 
        
        if (!HILOW_API_KEY) {
            throw new Error('La pasarela de pago no está disponible temporalmente.');
        }

        const response = await fetch(HILOW_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HILOW_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData: HilowApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Error en la pasarela de pago (${response.status}).`);
        }
        
        if (responseData && responseData.hilowOrderId) {
            const checkoutUrl = `https://hilowglobal.com/pay/${responseData.hilowOrderId}`;
            return { success: true, checkoutUrl: checkoutUrl };
        } else {
            throw new Error('Respuesta no válida de la pasarela de pago.');
        }

    } catch (error) {
        console.error('[PAYMENT] Gateway error:', error instanceof Error ? error.message : String(error));
        const rawMessage = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
        const sanitizedMessage = rawMessage.replace(/hilow(\s*global)?/gi, 'la pasarela de pago');
        return { success: false, message: sanitizedMessage };
    }
}
