import HomeClient from './home-client';
import { buildPageMetadata, getActiveProductsServer } from '@/lib/seo';

export const revalidate = 300;

export const metadata = buildPageMetadata({
  title: 'PuroRush | Premium Aromas & Leather Cleaners',
  description:
    'Explore our curated selection of premium quality aromas, leather cleaners, and custom packs with discreet 24/48h shipping across Spain and Europe.',
  path: '/',
});

export default async function Home() {
  const initialProducts = await getActiveProductsServer();
  return <HomeClient initialProducts={initialProducts} />;
}
