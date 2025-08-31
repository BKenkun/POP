import Stripe from 'stripe';
import type { Product, CartItem } from './types';
import { products as fallbackProducts } from './products';

// This is the global instance of Stripe, initialized once.
let stripe: Stripe | null = null;

const getStripeInstance = (): Stripe => {
    if (stripe) {
        return stripe;
    }
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
    }
    stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20',
        typescript: true,
    });
    return stripe;
};

export async function getStripeProducts(): Promise<Product[]> {
    try {
        const stripe = getStripeInstance();
        const products = await stripe.products.list({
            active: true,
            limit: 20,
            expand: ['data.default_price'],
        });

        const availableProducts: Product[] = products.data.map((product: any) => {
             const price = product.default_price;
             const stock = product.metadata.stock ? parseInt(product.metadata.stock, 10) : undefined;
             
             return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: price?.unit_amount || 0, 
                imageUrl: product.images?.[0] || 'https://picsum.photos/400/400',
                imageHint: 'product bottle',
                tags: product.metadata.tags?.split(',').map((t: string) => t.trim()) || [],
                galleryImages: product.metadata.gallery_images?.split(',').map((url: string) => url.trim()) || [],
                stock: stock,
             };
        }).filter(p => p.price > 0);
        
        if (availableProducts.length === 0) {
            console.warn("No active products with prices found on Stripe. Returning fallback products.");
            return fallbackProducts;
        }

        return availableProducts;

    } catch (error) {
        console.error("Error fetching products from Stripe:", error);
        console.warn("Returning fallback products due to an error.");
        return fallbackProducts;
    }
}

export async function createCheckoutSession(
    items: CartItem[]
): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
    try {
        const stripe = getStripeInstance();
        const line_items = items.map((item) => {
            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        images: item.imageUrl ? [item.imageUrl] : [],
                        description: item.description,
                    },
                    unit_amount: item.price, // Price in cents
                },
                quantity: item.quantity,
            };
        });

        const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/`,
            billing_address_collection: 'required',
            shipping_address_collection: {
              allowed_countries: ['ES'],
            },
        });

        if (!session.url) {
            return { sessionId: null, sessionUrl: null, error: 'Could not create checkout session URL.'}
        }

        return { sessionId: session.id, sessionUrl: session.url };
    } catch (error: any) {
        console.error('Error creating Stripe checkout session:', error);
        return { sessionId: null, sessionUrl: null, error: error.message };
    }
}
