import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Shipping Rates & Delivery Times',
  description:
    'Check our 24/48h discreet shipping rates for Spain, Balearic & Canary Islands, Europe, and worldwide destinations. Free shipping on orders over €40.',
  path: '/shipping',
});

export default function ShippingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
