import ProductsClient from './products-client';
import { buildPageMetadata, getActiveProductsServer } from '@/lib/seo';

export const revalidate = 300;

export const metadata = buildPageMetadata({
  title: 'All Products & Aromas Catalog',
  description:
    'Browse our complete catalog of original aromas, leather cleaners, packs, and accessories. Filter by brand, size, and composition with 24/48h discreet delivery.',
  path: '/products',
});

export default async function ProductsPage() {
  const initialProducts = await getActiveProductsServer();
  return <ProductsClient initialProducts={initialProducts} />;
}