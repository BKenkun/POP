import Stripe from 'stripe';
import type { Product } from './types';
import { products as fallbackProducts } from './products';

const getStripeInstance = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        console.error('STRIPE_SECRET_KEY is not set. Using fallback data.');
        return null;
    }
    return new Stripe(secretKey, {
        apiVersion: '2024-06-20',
    });
};

export async function getStripeProducts(): Promise<Product[]> {
    const stripe = getStripeInstance();
    if (!stripe) {
        // If Stripe is not configured, return the static product list as a fallback.
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
        // In case of an API error, return the fallback products to keep the page functional.
        return fallbackProducts;
    }
}
