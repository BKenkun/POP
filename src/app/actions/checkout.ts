'use server';

import { createCheckoutSession } from '@/lib/stripe';
import { CartItem } from '@/lib/types';

export async function createCheckoutSessionAction(
    items: CartItem[]
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
    return createCheckoutSession(items);
}
