'use server';

import { CartItem } from '@/lib/types';
import Stripe from 'stripe';

const getStripeInstance = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not set in your environment variables. Please check your .env.local file.');
    }
    return new Stripe(secretKey, {
        apiVersion: '2024-06-20',
    });
};

export async function createCheckoutSession(
    items: CartItem[]
): Promise<{ sessionId: string | null; error?: string }> {
    try {
        const stripe = getStripeInstance();
        const line_items = items.map((item) => {
            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        images: item.imageUrl ? [item.imageUrl] : [],
                    },
                    unit_amount: item.price, // Price in cents
                },
                quantity: item.quantity,
            };
        });

        // In a real application, you should get the domain dynamically
        const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/`,
        });

        return { sessionId: session.id };
    } catch (error: any) {
        console.error('Error creating Stripe checkout session:', error);
        return { sessionId: null, error: error.message };
    }
}
