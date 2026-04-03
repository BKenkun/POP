'use server';

/**
 * @fileoverview PLANTILLA: Contiene la lógica del backend de un cliente para crear un pedido en Hilow a través de la API segura.
 *
 * Propósito: Iniciar el proceso de pago.
 * ¿Qué hace?: Esta función se ejecuta en el servidor del cliente. Envía una petición POST segura a la API de Hilow.
 * Le dice a Hilow: "Hola, un cliente quiere pagar esta cantidad por este producto. Prepara una sesión de pago".
 * Este es el punto de partida de toda la transacción.
 */

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Crea un pedido a través del endpoint de API seguro de Hilow.
 * 
 * @param yourInternalOrderId El ID del pedido en la base de datos propia de tu tienda.
 * @param amountInCents El importe total del pedido en céntimos (ej: 2500 para 25.00€).
 * @param productName Un resumen del producto.
 * @param isSubscription Booleano para activar pagos recurrentes.
 * @param yourStoreHostname El dominio de tu tienda (ej: "comprarpopperonline.com").
 * @returns Un objeto con el estado de éxito y la URL de checkout.
 */
export async function createHilowApiOrder(
    yourInternalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean,
    yourStoreHostname: string 
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    try {
        // En producción, usa la URL absoluta de Hilow Global
        const HILOW_API_ENDPOINT = 'https://hilowglobal.app/api/orders';

        // Adaptamos las URLs de éxito y cancelación a las rutas de nuestra aplicación
        const successUrl = `https://${yourStoreHostname}/checkout/success?order_id=${yourInternalOrderId}`;
        const cancelUrl = `https://${yourStoreHostname}/checkout`;

        const payload = {
            storeId: yourStoreHostname,
            internalOrderId: yourInternalOrderId,
            amountInCents: amountInCents,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: successUrl,
            cancelUrl: cancelUrl,
        };

        // La API Key DEBE ser una variable de entorno SECRETA en tu servidor.
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 
        
        if (!HILOW_API_KEY) {
            throw new Error('La clave de API de Hilow (HILOW_API_KEY) no está configurada.');
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
            throw new Error(responseData.message || `Error de API de Hilow: ${response.status}`);
        }
        
        if (responseData && responseData.hilowOrderId) {
            // URL a la que redirigir al comprador
            const checkoutUrl = `https://hilowglobal.app/pay/${responseData.hilowOrderId}`;
            return { success: true, checkoutUrl: checkoutUrl };
        } else {
            throw new Error('Respuesta inválida de Hilow (falta ID de pedido).');
        }

    } catch (error) {
        console.error('Error de integración con Hilow:', error);
        return { success: false, message: (error as Error).message };
    }
}
