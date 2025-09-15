
'use server';

import { createCheckoutSession, createPackCheckoutSession } from '@/lib/stripe';
import { CartItem, PackItemBrief } from '@/lib/types';

// This action is for the main shopping cart
export async function createCheckoutSessionAction(
    items: CartItem[],
    userId?: string
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
     return createCheckoutSession(items, userId);
}

// This is a new, separate action specifically for the custom pack builder
export async function createCustomPackCheckoutAction(
    packItems: PackItemBrief[],
    discountedPrice: number,
    userId?: string
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
    const totalQuantity = packItems.reduce((sum, item) => sum + item.quantity, 0);
    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    
    // Create a virtual cart item representing the pack
    const customPackForCheckout: CartItem = {
        id: 'custom-pack',
        name: `Pack Personalizado (${totalQuantity} uds)`,
        description: packItems.map(item => `${item.quantity}x ${item.name}`).join(', '),
        price: discountedPrice,
        imageUrl: `${YOUR_DOMAIN}/pack-default.png`, // Placeholder image for packs
        imageHint: 'custom pack',
        quantity: 1, // A pack is a single item in checkout terms
    };
    
    // Pass the detailed pack items to the checkout session creator
    return createPackCheckoutSession(customPackForCheckout, packItems, userId);
}
