
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
      
      const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

      // This structure now matches Klaviyo's documented format.
      return {
        // Klaviyo standard fields
        "$custom_id": doc.id,
        "title": product.name,
        "description": product.description || '',
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://purorush.com'}/product/${doc.id}`,
        "price": product.price / 100,
        "featured_image": {
          "full": { "src": product.imageUrl },
          "thumbnail": { "src": product.imageUrl } // Use the same image for thumbnail
        },

        // Optional but recommended standard fields
        "compare_at_price": isOnSale ? product.originalPrice! / 100 : undefined,
        "categories": product.tags || [],
        "brand": product.brand || 'PuroRush',
        "inventory_quantity": product.stock !== undefined ? product.stock : 99,
        "inventory_policy": product.stock !== undefined && product.stock > 0 ? 1 : 2, // 1: Deny, 2: Continue if sold out

        // Custom metadata for segmentation
        "custom_metadata": {
          "size": product.size || null,
          "composition": product.composition || null,
          "is_on_sale": isOnSale,
          "internal_tags": product.internalTags || [],
        }
      };
    });
    
    // The final response must be wrapped in a 'data' object.
    return NextResponse.json({ data: products });

  } catch (error) {
    console.error('Error fetching product feed for Klaviyo:', error);
    return NextResponse.json({ error: 'Failed to fetch product feed.' }, { status: 500 });
  }
}
