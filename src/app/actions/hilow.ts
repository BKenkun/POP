'use server';

/**
 * @fileoverview Contiene la lógica del backend para crear un pedido en Hilow a través de la API segura.
 *
 * Propósito: Iniciar el proceso de pago.
 * ¿Qué hace?: Esta función se ejecuta en el servidor. Envía una petición POST segura a la API de Hilow.
 * Le dice a Hilow: "Hola, un cliente quiere pagar esta cantidad por este producto. Prepara una sesión de pago".
 * Este es el punto de partida de toda la transacción.
 */

interface HilowApiResponse {
    checkoutUrl?: string;
    message?: string;
}

/**
 * Crea un pedido a través del endpoint de API seguro de Hilow.
 *
 * @param yourInternalOrderId El ID del pedido en la base de datos propia de tu tienda.
 * @param amountInCents El importe total del pedido en céntimos.
 * @param productName Un resumen del producto o productos que se están comprando.
 * @param isSubscription Booleano que indica si el pedido es para una suscripción.
 * @param yourStoreHostname El nombre de host de tu tienda (ej. "comprarpopperonline.com").
 * @returns Un objeto con el estado de éxito y la URL de checkout, o un mensaje de error.
 */
export async function createHilowOrder(
    yourInternalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    if (amountInCents < 0 || !Number.isInteger(amountInCents)) {
        return { success: false, message: 'El importe debe ser un número entero positivo de céntimos.' };
    }

    const HILOW_API_KEY = process.env.HILOW_API_KEY;
    const HILOW_API_URL = 'https://hilowglobal.com/api/v1/create-order';
    const yourStoreHostname = 'comprarpopperonline.com';

    if (!HILOW_API_KEY) {
        console.error('La clave de API de Hilow (HILOW_API_KEY) no está configurada en las variables de entorno del servidor.');
        return { success: false, message: 'Error de configuración del servidor de pagos.' };
    }

    try {
        const yourStoreUrl = `https://${yourStoreHostname}`;
        const successUrl = `${yourStoreUrl}/checkout/success?order_id=${yourInternalOrderId}`;
        const cancelUrl = `${yourStoreUrl}/checkout`;

        const payload = {
            storeId: yourStoreHostname,
            internalOrderId: yourInternalOrderId,
            amountInCents: amountInCents,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: successUrl,
            cancelUrl: cancelUrl,
        };

        const response = await fetch(HILOW_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HILOW_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData: HilowApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `La API de Hilow falló con estado ${response.status}`);
        }
        
        if (responseData && responseData.checkoutUrl) {
            return { success: true, checkoutUrl: responseData.checkoutUrl };
        } else {
            throw new Error('La respuesta de la API de Hilow no contenía una URL de pago (checkoutUrl).');
        }

    } catch (error) {
        console.error('Error creando el pedido en la API de Hilow:', error);
        return { success: false, message: (error as Error).message || 'Fallo al conectar con el servicio de pago.' };
    }
}
