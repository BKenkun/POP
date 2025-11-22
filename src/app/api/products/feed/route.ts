
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';

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
      return NextResponse.json([]);
    }

    const products = snapshot.docs.map(doc => {
      const product = doc.data() as Product;
      
      const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

      // This structure now matches the simple array/list format Klaviyo expects.
      return {
        "id": doc.id,
        "title": product.name,
        "link": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://purorush.com'}/product/${doc.id}`,
        "description": product.description || '',
        "price": product.price / 100,
        "image_link": product.imageUrl,
        "categories": product.tags || [],
        "inventory_quantity": product.stock !== undefined ? product.stock : 99,
        "inventory_policy": product.stock !== undefined && product.stock > 0 ? 1 : 2, // 1: Deny, 2: Continue if sold out
        "brand": product.brand || 'PuroRush',
        "compare_at_price": isOnSale ? product.originalPrice! / 100 : undefined,
      };
    });
    
    // The final response must be a simple array of product objects.
    return NextResponse.json(products);

  } catch (error) {
    console.error('Error fetching product feed for Klaviyo:', error);
    return NextResponse.json({ error: 'Failed to fetch product feed.' }, { status: 500 });
  }
}
