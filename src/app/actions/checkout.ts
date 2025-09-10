
'use server';

import { createCheckoutSession, createPackCheckoutSession } from '@/lib/stripe';
import { CartItem, PackItemBrief } from '@/lib/types';

// This action is for the main shopping cart
export async function createCheckoutSessionAction(
    items: CartItem[]
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
     return createCheckoutSession(items);
}

// This is a new, separate action specifically for the custom pack builder
export async function createCustomPackCheckoutAction(
    packItems: PackItemBrief[],
    discountedPrice: number
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
    const totalQuantity = packItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create a virtual cart item representing the pack
    const customPackForCheckout: CartItem = {
        id: 'custom-pack',
        name: `Pack Personalizado (${totalQuantity} uds)`,
        description: packItems.map(item => `${item.quantity}x ${item.name}`).join(', '),
        price: discountedPrice,
        imageUrl: 'https://picsum.photos/seed/pack/400/400',
        imageHint: 'custom pack',
        quantity: 1, // A pack is a single item
    };
    
    return createPackCheckoutSession(customPackForCheckout);
}
