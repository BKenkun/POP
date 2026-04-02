'use server';

/**
 * @fileoverview Backend logic to create an order in Hilow via the secure API.
 */

const HILOW_PLATFORM_URL = 'https://hilowglobal.com'; 

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Creates an order through Hilow's secure API endpoint.
 *
 * @param yourInternalOrderId The unique ID of the order in our database.
 * @param amountInCents Total amount in cents.
 * @param productName Summary of products.
 * @param isSubscription Boolean for recurring payments.
 * @param yourStoreHostname The hostname of the store (e.g., "comprarpopperonline.com").
 * @returns Object with success status and the checkout URL for redirection.
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
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 

        if (!HILOW_API_KEY) {
            throw new Error('HILOW_API_KEY is not configured on the server.');
        }

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
