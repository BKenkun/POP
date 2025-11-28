
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';

export const revalidate = 3600; // Revalidate at most every hour

/**
 * API endpoint to fetch all active products in a clean JSON array format.
 * URL: /api/products/feed/json
 */
export async function GET() {
  try {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('active', '!=', false).get();

    if (snapshot.empty) {
      // Return an empty JSON array if no products are found
      return new Response('[]', {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const products = snapshot.docs.map(doc => {
      const product = doc.data() as Product;
      const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

      // Map to a clean product structure
      return {
        id: doc.id,
        title: product.name,
        link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://purorush.com'}/product/${doc.id}`,
        description: product.description || '',
        price: product.price / 100,
        image_link: product.imageUrl,
        brand: product.brand || 'PuroRush',
        compare_at_price: isOnSale ? product.originalPrice! / 100 : undefined,
        categories: product.tags || [],
        inventory_quantity: product.stock !== undefined ? product.stock : 99,
        inventory_policy: product.stock !== undefined ? 1 : 2, // 1: Deny, 2: Continue
        custom_metadata: {
          size: product.size || null,
          composition: product.composition || null,
          is_on_sale: isOnSale,
          internal_tags: product.internalTags || [],
        }
      };
    });

    // Manually stringify the array to ensure a raw JSON array response
    const jsonString = JSON.stringify(products, null, 2);

    // Use new Response() to return the raw JSON string without any wrappers
    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating JSON product feed:', error);
    const errorResponse = JSON.stringify({ error: 'Failed to generate product feed.' });
    return new Response(errorResponse, {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
