
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';

// La caché se elimina para asegurar que siempre se sirva la versión más reciente del código.
// export const revalidate = 3600;

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
      // Devuelve un array JSON vacío si no hay productos
      return new Response('[]', {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const products = snapshot.docs.map(doc => {
      const product = doc.data() as Product;
      
      const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

      // Mapeo a la estructura final que espera Klaviyo
      return {
        "id": doc.id,
        "title": product.name,
        "link": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://purorush.com'}/product/${doc.id}`,
        "description": product.description || '',
        "price": product.price / 100,
        "image_link": product.imageUrl,
        "categories": product.tags || [],
        "inventory_quantity": product.stock !== undefined ? product.stock : 99,
        "inventory_policy": product.stock !== undefined ? 1 : 2,
        "brand": product.brand || 'PuroRush',
        "compare_at_price": isOnSale ? product.originalPrice! / 100 : undefined,
      };
    });
    
    // Convertir el array de productos a un string JSON
    const jsonString = JSON.stringify(products);

    // Devolver una respuesta manual para evitar el envoltorio "data" de Next.js
    return new Response(jsonString, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate' // Opcional: Control de caché
        }
    });

  } catch (error) {
    console.error('Error fetching product feed for Klaviyo:', error);
    // Devolver un error en formato JSON
    return new Response(JSON.stringify({ error: 'Failed to fetch product feed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
