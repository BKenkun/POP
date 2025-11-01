'use server';

import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';

export const revalidate = 3600; // Revalidate at most every hour

/**
 * API endpoint to fetch all active products for a Klaviyo catalog feed.
 * This format is specifically tailored for what Klaviyo's custom catalog source expects.
 * URL: /api/products/feed
 */
export async function GET() {
  try {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('active', '!=', false).get();

    if (snapshot.empty) {
      return NextResponse.json({ data: [] });
    }

    const products = snapshot.docs.map(doc => {
      const product = doc.data() as Product;
      return {
        // Klaviyo expects specific field names. We map our Product type to their format.
        // We use the product ID as the $custom_id.
        "$custom_id": doc.id,
        "title": product.name,
        "description": product.description || '',
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://purorush.com'}/product/${doc.id}`,
        "image_full_url": product.imageUrl,
        "price": product.price / 100, // Klaviyo expects price as a number, not cents.
        // Optional but recommended fields
        "categories": product.tags || [],
        "brand": product.brand || 'PuroRush',
        "inventory_quantity": product.stock !== undefined ? product.stock : 99, // Fallback stock
        "inventory_policy": product.stock !== undefined ? 1 : 2, // 1: Deny, 2: Continue
      };
    });
    
    // The key change: Klaviyo expects the array to be under a 'data' property.
    return NextResponse.json({ data: products });

  } catch (error) {
    console.error('Error fetching product feed for Klaviyo:', error);
    return NextResponse.json({ error: 'Failed to fetch product feed.' }, { status: 500 });
  }
}
