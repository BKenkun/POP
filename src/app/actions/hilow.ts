'use server';

/**
 * @fileoverview INTEGRACIÓN HILOW (VERSIÓN UNIFICADA)
 * Lógica para crear pedidos de forma segura en la pasarela de pagos.
 */

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Crea un pedido a través de la API de Hilow.
 */
export async function createHilowApiOrder(
    yourInternalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean,
    yourStoreUrl: string 
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    try {
        // 1. Validaciones básicas
        const sanitizedAmount = Math.round(amountInCents);
        if (sanitizedAmount <= 0) {
            throw new Error('El importe debe ser mayor a 0.');
        }

        // 2. Configuración desde variables de entorno
        const HILOW_API_KEY = process.env.HILOW_API_KEY;
        const HILOW_API_BASE_URL = process.env.HILOW_API_BASE_URL || 'https://hilowglobal.com';
        const HILOW_STORE_ID = process.env.HILOW_STORE_ID || new URL(yourStoreUrl).hostname;

        if (!HILOW_API_KEY) {
            throw new Error('HILOW_API_KEY no configurada en el servidor.');
        }

        // 3. Preparación del Payload
        const payload = {
            storeId: HILOW_STORE_ID,
            internalOrderId: yourInternalOrderId,
            amountInCents: sanitizedAmount,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: `${yourStoreUrl}/checkout/success?order_id=${yourInternalOrderId}`,
            cancelUrl: `${yourStoreUrl}/checkout`,
        };

        // Debug en desarrollo
        if (process.env.NODE_ENV !== 'production') {
            console.log('[Hilow] Creando pedido:', payload);
        }

        // 4. Llamada a la API
        const response = await fetch(`${HILOW_API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HILOW_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData: HilowApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Error API: ${response.status}`);
        }
        
        if (responseData && responseData.hilowOrderId) {
            const checkoutUrl = `${HILOW_API_BASE_URL}/pay/${responseData.hilowOrderId}`;
            return { success: true, checkoutUrl };
        } else {
            throw new Error('La API de Hilow no devolvió un ID de pedido válido.');
        }

    } catch (error) {
        console.error('Hilow Integration Error:', error);
        return { 
            success: false, 
            message: (error as Error).message || 'Error al conectar con la pasarela de pago.' 
        };
    }
}