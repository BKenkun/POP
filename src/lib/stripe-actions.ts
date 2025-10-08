
'use server';

import Stripe from 'stripe';
import type { Product } from './types';

// Initialize Stripe on the server
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20',
    typescript: true,
});

// Helper to normalize image URLs, ensuring they have a protocol
const normalizeImageUrl = (url: string): string => {
  const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  if (!url) return `${YOUR_DOMAIN}/product-placeholder.png`;
  if (url.startsWith('http')) {
    return url;
  }
  return `https://${url.replace(/^\/\//, '')}`;
};

/**
 * Fetches all active products from Stripe and formats them.
 */
export async function getStripeProducts(): Promise<Product[]> {
    const productsResponse = await stripe.products.list({
        limit: 100,
        expand: ['data.default_price'],
    });

    const availableProducts: Product[] = productsResponse.data
        .map((product: any) => {
            const price = product.default_price as Stripe.Price | null;
            const stock = product.metadata.stock ? parseInt(product.metadata.stock, 10) : undefined;

            const longDescParts = Object.entries(product.metadata)
                .filter(([key]) => key.startsWith('long_description_'))
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, undefined, { numeric: true }))
                .map(([, value]) => value as string);
            const longDescription = longDescParts.length > 0 ? longDescParts.join('') : undefined;

            return {
                id: product.id,
                active: product.active,
                priceId: price?.id,
                name: product.name,
                description: product.description,
                longDescription: longDescription,
                price: price?.unit_amount || 0,
                imageUrl: normalizeImageUrl(product.images?.[0] || ''),
                imageHint: 'product bottle',
                tags: product.metadata.tags?.split(',').map((t: string) => t.trim()) || [],
                internalTags: product.metadata.internal_tags?.split(',').map((t: string) => t.trim()) || [],
                galleryImages: product.metadata.gallery_images?.split(',').map((url: string) => normalizeImageUrl(url.trim())) || [],
                stock: stock,
                productDetails: product.metadata.product_details,
                brand: product.metadata.brand,
                size: product.metadata.size,
                composition: product.metadata.composition,
            };
        })
        .filter((p) => p.price > 0 && p.internalTags?.includes('popper')); // Filter for popper products with a price

    return availableProducts;
}

/**
 * Fetches a single product from Stripe by its ID.
 */
export async function getStripeProductById(productId: string): Promise<Product | null> {
    try {
        const product = await stripe.products.retrieve(productId, {
            expand: ['default_price'],
        });

        if (!product) return null;

        const price = product.default_price as Stripe.Price | null;
        const stock = product.metadata.stock ? parseInt(product.metadata.stock, 10) : undefined;
        
        const longDescParts = Object.entries(product.metadata)
            .filter(([key]) => key.startsWith('long_description_'))
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, undefined, { numeric: true }))
            .map(([, value]) => value as string);
        const longDescription = longDescParts.length > 0 ? longDescParts.join('') : undefined;

        return {
            id: product.id,
            active: product.active,
            priceId: price?.id,
            name: product.name,
            description: product.description,
            longDescription: longDescription,
            price: price?.unit_amount || 0,
            imageUrl: normalizeImageUrl(product.images?.[0] || ''),
            imageHint: 'product bottle',
            tags: product.metadata.tags?.split(',').map((t: string) => t.trim()) || [],
            internalTags: product.metadata.internal_tags?.split(',').map((t: string) => t.trim()) || [],
            galleryImages: product.metadata.gallery_images?.split(',').map((url: string) => normalizeImageUrl(url.trim())) || [],
            stock: stock,
            productDetails: product.metadata.product_details,
            brand: product.metadata.brand,
            size: product.metadata.size,
            composition: product.metadata.composition,
        };
    } catch (error: any) {
        if (error.code === 'resource_missing') {
            return null;
        }
        console.error("Error fetching product from Stripe:", error);
        throw error;
    }
}
