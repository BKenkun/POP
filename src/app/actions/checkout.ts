
'use server';

// This server action has been deprecated.
// The order creation logic has been moved to the client-side
// in `src/app/checkout/checkout-client-page.tsx` to ensure
// operations are executed under the client's authenticated context,
// resolving conflicts between Firebase Client and Admin SDKs.

import { CartItem, Order, ShippingAddress } from '@/lib/types';

interface CreateOrderParams {
    userId: string;
    cartItems: CartItem[];
    cartTotal: number;
    customerName: string;
    customerEmail: string;
    shippingAddress: ShippingAddress;
    paymentMethod: Order['paymentMethod'];
}

export async function createOrder(params: CreateOrderParams): Promise<{ orderId: string | null; error: string | null }> {
    console.warn("DEPRECATED: createOrder server action called. Logic has moved to client.");
    return { orderId: null, error: 'This function is deprecated. Order creation is now handled on the client.' };
}
