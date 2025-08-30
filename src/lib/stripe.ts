import Stripe from 'stripe';
import type { Product, CartItem } from './types';
import { products as fallbackProducts } from './products';

// This is the global instance of Stripe, initialized once.
let stripe: Stripe | null = null;

const getStripeInstance = () => {
    if (stripe) {
        return stripe;
    }
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        console.error('STRIPE_SECRET_KEY is not set in your environment variables. Using fallback data.');
        return null;
    }
    stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20',
        typescript: true,
    });
    return stripe;
};

export async function getStripeProducts(): Promise<Product[]> {
    const stripe = getStripeInstance();
    if (!stripe) {
        return fallbackProducts;
    }

    try {
        const products = await stripe.products.list({
            active: true,
            limit: 20,
            expand: ['data.default_price'],
        });

        const availableProducts: Product[] = products.data.map((product: any) => {
             const price = product.default_price;
             return {
                id: product.id,
                name: product.name,
                price: price?.unit_amount || 0, 
                imageUrl: product.images?.[0] || 'https://picsum.photos/400/400',
                imageHint: 'product bottle',
                tag: product.metadata.tag,
             };
        }).filter(p => p.price > 0);
        
        if (availableProducts.length === 0) {
            console.log("No active products with prices found on Stripe. Returning fallback products.");
            return fallbackProducts;
        }

        return availableProducts;

    } catch (error) {
        console.error("Error fetching products from Stripe:", error);
        return fallbackProducts;
    }
}

export async function createCheckoutSession(
    items: CartItem[]
): Promise<{ sessionId: string | null; error?: string }> {
     const stripe = getStripeInstance();
    if (!stripe) {
        return { sessionId: null, error: 'Stripe is not configured.' };
    }

    try {
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
