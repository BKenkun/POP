import { NextResponse } from 'next/server';
import {
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminFirestore,
} from '@/lib/firebase-admin';
import { Product } from '@/lib/types';
import { products as fallbackProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate at most every hour

/**
 * API endpoint to fetch all active products for a Klaviyo catalog feed.
 * This format is specifically tailored for what Klaviyo's custom catalog source expects.
 * URL: /api/products/feed
 */
export async function GET() {
  try {
    let rawProducts: { id: string; data: Product }[] = [];

    if (areAdminCredentialsAvailable()) {
      try {
        const snapshot = await runWithAdminFirestore(
          (db) => db.collection('products').where('active', '!=', false).get(),
          'products-feed'
        );
        if (!snapshot.empty) {
          rawProducts = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as Product }));
        }
      } catch (dbError: unknown) {
        if (!isAdminCredentialError(dbError)) {
          const msg = dbError instanceof Error ? dbError.message : String(dbError);
          console.info(`[FEED] Firestore feed query fallback to static products (${msg})`);
        }
      }
    }

    if (rawProducts.length === 0) {
      rawProducts = fallbackProducts.map(p => ({ id: p.id, data: p }));
    }

    const products = rawProducts.map(({ id, data: product }) => {
      const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

      return {
        // Klaviyo standard fields
        "$custom_id": id,
        "title": product.name,
        "description": product.description || '',
        "url": `${(process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://comprarpopperonline.com').replace(/\/$/, '')}/product/${id}`,
        "image_full_url": product.imageUrl,
        "price": product.price / 100,
        // Optional but recommended standard fields
        "compare_at_price": isOnSale ? product.originalPrice! / 100 : undefined,
        "categories": product.tags || [],
        "brand": product.brand || 'PuroRush',
        "inventory_quantity": product.stock !== undefined ? product.stock : 99,
        "inventory_policy": product.stock !== undefined ? 1 : 2, // 1: Deny, 2: Continue
        // Custom metadata for segmentation
        "custom_metadata": {
          "size": product.size || null,
          "composition": product.composition || null,
          "is_on_sale": isOnSale,
          "internal_tags": product.internalTags || [],
        }
      };
    });
    
    return NextResponse.json({ data: products });

  } catch (error) {
    console.error('Error fetching product feed for Klaviyo:', error);
    return NextResponse.json({ error: 'Failed to fetch product feed.' }, { status: 500 });
  }
}

