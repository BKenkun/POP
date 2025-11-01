'use server';

import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';

export const revalidate = 3600; // Revalidate at most every hour

/**
 * API endpoint to fetch all active products for a Klaviyo catalog feed.
 * URL: /api/products/feed
 */
export async function GET() {
  try {
    const productsRef = firestore.collection('products');
    // We only fetch active products for the public feed.
    const snapshot = await productsRef.where('active', '!=', false).get();

    if (snapshot.empty) {
      return NextResponse.json({ products: [] });
    }

    const products: Product[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Ensure all fields from the Product interface are included
        name: data.name,
        price: data.price,
        imageUrl: data.imageUrl,
        description: data.description || null,
        longDescription: data.longDescription || null,
        originalPrice: data.originalPrice || undefined,
        tags: data.tags || [],
        internalTags: data.internalTags || [],
        galleryImages: data.galleryImages || [],
        stock: data.stock === undefined ? undefined : data.stock,
        sku: data.sku || '',
        active: data.active === undefined ? true : data.active,
        productDetails: data.productDetails || '',
        brand: data.brand || '',
        size: data.size || '',
        composition: data.composition || '',
        url: data.url || '',
        web: data.web || '',
        offerStartDate: data.offerStartDate || null,
        offerEndDate: data.offerEndDate || null,
        cost: data.cost || 0,
        includesVat: data.includesVat === undefined ? true : data.includesVat,
        vatPercentage: data.vatPercentage || 21,
        imageHint: data.imageHint || '',
      };
    });
    
    return NextResponse.json({ products });

  } catch (error) {
    console.error('Error fetching product feed for Klaviyo:', error);
    return NextResponse.json({ error: 'Failed to fetch product feed.' }, { status: 500 });
  }
}