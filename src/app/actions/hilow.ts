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

        // Tu API Key de Hilow (hlw_live_...) obtenida en el portal
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 
        
        if (!HILOW_API_KEY) {
            throw new Error('HILOW_API_KEY no configurada en las variables de entorno del cliente.');
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
            throw new Error(responseData.message || `API Error: ${response.status}`);
        }
        
        if (responseData && responseData.hilowOrderId) {
            // URL final de la pasarela Hilow a la que debes redirigir al usuario
            const checkoutUrl = `https://hilowglobal.com/pay/${responseData.hilowOrderId}`;
            return { success: true, checkoutUrl: checkoutUrl };
        } else {
            throw new Error('Respuesta inválida de la API de Hilow.');
        }

    } catch (error) {
        console.error('Hilow Integration Error:', error);
        return { success: false, message: (error as Error).message };
    }
}
