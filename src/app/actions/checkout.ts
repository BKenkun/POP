
'use server';

import { createCheckoutSession, createPackCheckoutSession } from '@/lib/stripe';
import { CartItem } from '@/lib/types';

export async function createCheckoutSessionAction(
    items: CartItem[]
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
     // Check if there is a custom pack in the cart
    const customPack = items.find(item => item.id === 'custom-pack');
    
    if (customPack) {
        // If there's a pack, we assume it's the only item for this checkout type.
        // We pass the price and a generated description to Stripe.
        return createPackCheckoutSession(customPack);
    } else {
        // Otherwise, process as a standard multi-product checkout
        return createCheckoutSession(items);
    }
}
