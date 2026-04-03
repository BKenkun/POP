'use server';

/**
 * @fileoverview Secure backend action to create a payment session in Hilow.
 *
 * This function communicates with the Hilow API to initiate a payment flow.
 */

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Creates an order via the secure Hilow API endpoint.
 * 
 * @param yourInternalOrderId The unique ID of the order in your own database.
 * @param amountInCents Total order amount in cents.
 * @param productName Summary of products being purchased.
 * @param isSubscription Boolean to enable recurring payments.
 * @param yourStoreHostname Domain of your store (e.g., "purorush.com").
 * @returns Success status and the checkout redirect URL.
 */
export async function createHilowApiOrder(
    yourInternalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean,
    yourStoreHostname: string 
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    try {
        // Production endpoint for Hilow Global
        const HILOW_API_ENDPOINT = 'https://hilowglobal.app/api/orders';

        // URLs for customer redirection after payment
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

        // API Key from server environment variables
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 
        
        if (!HILOW_API_KEY) {
            throw new Error('HILOW_API_KEY is not configured in the server environment.');
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
            throw new Error(responseData.message || `Hilow API Error: ${response.status}`);
        }
        
        if (responseData && responseData.hilowOrderId) {
            // Final URL to redirect the buyer to the payment gateway
            const checkoutUrl = `https://hilowglobal.app/pay/${responseData.hilowOrderId}`;
            return { success: true, checkoutUrl: checkoutUrl };
        } else {
            throw new Error('Invalid response from Hilow (missing order ID).');
        }

    } catch (error) {
        console.error('Hilow Integration Error:', error);
        return { success: false, message: (error as Error).message };
    }
}
