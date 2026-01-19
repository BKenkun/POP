
'use server';

interface CreateOrderResult {
  success: boolean;
  checkoutUrl?: string;
  message?: string;
}

/**
 * Creates an order in the Hilow API.
 * This function should be called from your server-side logic.
 *
 * @param internalOrderId - Your unique order ID (e.g., 'BK-12345').
 * @param amountInCents - The total amount of the order in cents.
 * @param productName - A description of the order content.
 * @param isSubscription - Set to true if this is a recurring subscription.
 * @param yourStoreUrl - The base URL of your store.
 * @returns An object with the checkout URL or an error message.
 */
export async function createHilowApiOrder(
  internalOrderId: string,
  amountInCents: number,
  productName: string,
  isSubscription: boolean,
  yourStoreUrl: string
): Promise<CreateOrderResult> {
  const HILOW_API_KEY = process.env.HILOW_API_KEY;
  const HILOW_API_URL = 'https://hilowglobal.com/api/create-order'; // Example URL

  if (!HILOW_API_KEY) {
    console.error('Error: HILOW_API_KEY is not set in environment variables.');
    return {
      success: false,
      message: 'Server configuration error: Missing API Key.',
    };
  }

  const payload = {
    storeId: "bukkakery.com", // This should be your registered store ID with Hilow
    internalOrderId,
    amountInCents,
    productName,
    isSubscription,
    successUrl: `${yourStoreUrl}/shop/checkout/success?order_id=${internalOrderId}`,
    cancelUrl: `${yourStoreUrl}/shop/cart`,
  };

  try {
    const response = await fetch(HILOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HILOW_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order with Hilow API.');
    }

    if (!data.checkoutUrl) {
      throw new Error('Hilow API did not return a checkout URL.');
    }

    return {
      success: true,
      checkoutUrl: data.checkoutUrl,
    };
  } catch (error: any) {
    console.error('Error creating Hilow API order:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };
  }
}
