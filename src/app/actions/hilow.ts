'use server';

/**
 * @fileoverview PLANTILLA: Contiene la lógica del backend de un cliente para crear un pedido en Hilow a través de la API segura.
 *
 * Propósito: Iniciar el proceso de pago.
 * ¿Qué hace?: Esta función se ejecuta en el servidor del cliente. Envía una petición POST segura a la API de Hilow.
 * Le dice a Hilow: "Hola, un cliente quiere pagar esta cantidad por este producto. Prepara una sesión de pago".
 * Este es el punto de partida de toda la transacción.
 */

const HILOW_PLATFORM_URL = 'https://hilowglobal.com'; 

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Crea un pedido a través del endpoint de API seguro de Hilow.
 * Este es el único método correcto y autorizado para iniciar un pago.
 *
 * IMPORTANTE: El `yourInternalOrderId` debe ser el ID único y persistente del pedido en TU PROPIA base de datos.
 *
 * @param yourInternalOrderId El ID del pedido en la base de datos propia de tu tienda (ej. el ID autogenerado por Firestore).
 * @param amountInCents El importe total del pedido en céntimos (debe ser un número entero positivo).
 * @param productName Un resumen del producto o productos que se están comprando.
 * @param isSubscription Booleano que indica si el pedido es para una suscripción. Poniendo esto a `true` activa el flujo de pagos recurrentes.
 * @param yourStoreHostname El nombre de host de tu tienda (ej. "comprarpopperonline.com").
 * @returns Un objeto con el estado de éxito y la URL de checkout, o un mensaje de error.
 */
export async function createHilowApiOrder(
    yourInternalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean,
    yourStoreHostname: string
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    if (amountInCents < 0 || !Number.isInteger(amountInCents)) {
        return { success: false, message: 'Amount must be a positive integer in cents.' };
    }

    try {
        // --- URLs a las que Hilow redirigirá al comprador ---
        const yourStoreUrl = `https://${yourStoreHostname}`;
        // Standardizing routes based on our app structure
        const successUrl = `${yourStoreUrl}/checkout/success?order_id=${yourInternalOrderId}`;
        const cancelUrl = `${yourStoreUrl}/checkout`;

        // --- ESTE ES EL CUERPO DE LA SOLICITUD (REQUEST BODY) CORRECTO ---
        const payload = {
            storeId: yourStoreHostname,
            internalOrderId: yourInternalOrderId,
            amountInCents: amountInCents,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: successUrl,
            cancelUrl: cancelUrl,
        };

        // ⚠️ IMPORTANTE: La API Key DEBE ser una variable de entorno SECRETA en tu servidor.
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 
        
        if (!HILOW_API_KEY) {
            throw new Error('HILOW_API_KEY is not configured on the server.');
        }

        const response = await fetch(`${HILOW_PLATFORM_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HILOW_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData: HilowApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Hilow API failed with status ${response.status}`);
        }
        
        if (responseData && responseData.hilowOrderId) {
            // URL de pago final en la pasarela de Hilow
            const checkoutUrl = `${HILOW_PLATFORM_URL}/pay/${responseData.hilowOrderId}`;
            return { success: true, checkoutUrl: checkoutUrl };
        } else {
            throw new Error('Hilow API response did not contain a valid order ID.');
        }

    } catch (error) {
        console.error('Error creating order in Hilow API:', error);
        return { success: false, message: (error as Error).message || 'Failed to connect to the payment service.' };
    }
}
