'use server';

/**
 * @fileoverview Secure backend actions for Hilow payment integration.
 *
 * This file handles server-to-server communication with the Hilow platform
 * to initiate payment sessions for single orders and subscriptions.
 */

const HILOW_PLATFORM_URL = 'https://hilowglobal.com'; 

interface HilowApiResponse {
    hilowOrderId: string;
    message?: string;
}

/**
 * Creates an order through Hilow's secure API endpoint.
 * This is the authorized method to start a payment session.
 *
 * @param internalOrderId The unique ID of the order in our database.
 * @param amountInCents The total amount in cents (must be a positive integer).
 * @param productName A summary of the products being purchased.
 * @param isSubscription Boolean indicating if this is a recurring payment.
 * @param storeHostname The hostname of the store (e.g., "comprarpopperonline.com").
 * @returns Object with success status and the checkout URL for redirection.
 */
export async function createHilowApiOrder(
    internalOrderId: string, 
    amountInCents: number, 
    productName: string,
    isSubscription: boolean,
    storeHostname: string
): Promise<{ success: boolean; checkoutUrl?: string; message?: string }> {
    
    if (amountInCents < 0 || !Number.isInteger(amountInCents)) {
        return { success: false, message: 'Amount must be a positive integer in cents.' };
    }

    try {
        const HILOW_API_KEY = process.env.HILOW_API_KEY; 

        if (!HILOW_API_KEY) {
            throw new Error('HILOW_API_KEY is not configured on the server.');
        }

        // Final URLs where the customer returns after payment
        const storeUrl = `https://${storeHostname}`;
        const successUrl = `${storeUrl}/checkout/success?order_id=${internalOrderId}`;
        const cancelUrl = `${storeUrl}/checkout`;

        const payload = {
            storeId: storeHostname,
            internalOrderId: internalOrderId,
            amountInCents: amountInCents,
            productName: productName,
            isSubscription: isSubscription,
            successUrl: successUrl,
            cancelUrl: cancelUrl,
        };

        // Secure call to Hilow platform
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
            // Build the full URL to the Hilow payment gateway
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
