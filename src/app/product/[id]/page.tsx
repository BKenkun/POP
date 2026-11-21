import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './product-detail-client';
import {
  buildPageMetadata,
  getActiveProductsServer,
  getProductByIdServer,
  getSiteUrl,
  SITE_NAME,
} from '@/lib/seo';

export const revalidate = 300;

function stripHtml(input?: string | null): string {
  if (!input) return '';
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProductByIdServer(params.id);

  if (!product || product.active === false) {
    return {
      title: 'Product Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const rawDescription =
    stripHtml(product.description) ||
    stripHtml(product.longDescription) ||
    `Buy ${product.name} at ${SITE_NAME} with discreet 24/48h shipping across Spain and Europe.`;

  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, 157).trimEnd()}...`
      : rawDescription;

  return buildPageMetadata({
    title: product.name,
    description,
    path: `/product/${product.id}`,
    images: product.imageUrl
      ? [{ url: product.imageUrl, alt: product.name }]
      : undefined,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, allProducts] = await Promise.all([
    getProductByIdServer(params.id),
    getActiveProductsServer(),
  ]);

  if (!product || product.active === false) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/product/${product.id}`;
  const cleanDescription =
    stripHtml(product.description) ||
    stripHtml(product.longDescription) ||
    product.name;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl, ...(product.galleryImages || [])].filter(Boolean),
    description: cleanDescription,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock === 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient
        initialProduct={product}
        initialAllProducts={allProducts}
      />
    </>
  );
}
