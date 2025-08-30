import Stripe from 'stripe';
import type { Product } from './types';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in your environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});

export async function getStripeProducts(): Promise<Product[]> {
    try {
        const products = await stripe.products.list({
            active: true,
            limit: 20, // Get up to 20 products
            expand: ['data.default_price'], // Important: expand the price data
        });

        const availableProducts: Product[] = products.data.map((product: any) => {
             const price = product.default_price;
             return {
                id: product.id,
                name: product.name,
                // Stripe returns price in cents, which is what our app expects
                price: price?.unit_amount || 0, 
                imageUrl: product.images?.[0] || 'https://picsum.photos/400/400',
                imageHint: 'product bottle', // generic hint
                tag: product.metadata.tag,
             };
        }).filter(p => p.price > 0); // Only show products with a valid price

        return availableProducts;

    } catch (error) {
        console.error("Error fetching products from Stripe:", error);
        return [];
    }
}
