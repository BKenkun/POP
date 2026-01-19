'use server';

// The base URL for the Hilow platform.
const HILOW_PLATFORM_URL = 'https://hilowglobal.com'; 

// The base URL of our store.
const CPO_STORE_URL = 'https://comprarpopperonline.com';

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * This function securely communicates from our server to Hilow's server.
 */
export async function createHilowOrder(
    internalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    try {
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 

        if (!HILOW_API_KEY) {
            throw new Error('La HILOW_API_KEY no está configurada en el servidor.');
        }

        // --- FINAL URLs where the customer will be redirected AFTER payment ---
        const successUrl = `${CPO_STORE_URL}/checkout/success?order_id=${internalOrderId}`;
        const cancelUrl = `${CPO_STORE_URL}/checkout`;

        // The payload sent to the Hilow API.
        const payload = {
            storeId: "comprarpopperonline.com", // Our store's hostname
            internalOrderId: internalOrderId,
            amountInCents: amountInCents,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: successUrl, // Final URL on our domain
            cancelUrl: cancelUrl,   // Final URL on our domain
        };

        // Call to the Hilow API.
        const response = await fetch(`${HILOW_PLATFORM_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HILOW_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `La API de Hilow falló con estado ${response.status}`);
        }
        
        // --- IMPORTANT: Build the FULL URL to the Hilow payment gateway ---
        const checkoutUrl = `${HILOW_PLATFORM_URL}/pay/${responseData.hilowOrderId}`;
        
        // Return the full URL to the frontend for redirection.
        return { success: true, checkoutUrl: checkoutUrl };

    } catch (error) {
        console.error('Error al crear el pedido en la API de Hilow:', error);
        return { success: false, message: (error as Error).message || 'Fallo al conectar con el servicio de pago.' };
    }
}
