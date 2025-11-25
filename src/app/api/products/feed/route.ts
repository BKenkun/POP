
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';

// Helper function to escape characters that are illegal in XML
const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  try {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('active', '!=', false).get();

    if (snapshot.empty) {
      const emptyXml = '<?xml version="1.0" encoding="UTF-8"?><Products></Products>';
      return new Response(emptyXml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    const productEntries = snapshot.docs.map(doc => {
      const product = doc.data() as Product;
      const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

      // Map to Klaviyo standard fields
      const productData = {
        id: doc.id,
        title: product.name,
        link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://purorush.com'}/product/${doc.id}`,
        description: product.description || '',
        price: product.price / 100,
        image_link: product.imageUrl,
        brand: product.brand || 'PuroRush',
        ...(isOnSale && { compare_at_price: product.originalPrice! / 100 }),
      };

      // Build the XML string for each product
      return `
  <Product>
    <id>${escapeXml(productData.id)}</id>
    <title>${escapeXml(productData.title)}</title>
    <link>${escapeXml(productData.link)}</link>
    <description>${escapeXml(productData.description)}</description>
    <price>${productData.price.toFixed(2)}</price>
    <image_link>${escapeXml(productData.image_link)}</image_link>
    <brand>${escapeXml(productData.brand)}</brand>
    ${productData.compare_at_price ? `<compare_at_price>${productData.compare_at_price.toFixed(2)}</compare_at_price>` : ''}
  </Product>`;
    }).join('');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Products>
${productEntries}
</Products>`;

    // Return the raw XML string with the correct Content-Type
    return new Response(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating product XML feed:', error);
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?><Error><Message>Failed to generate product feed.</Message></Error>`;
    return new Response(errorXml, {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
