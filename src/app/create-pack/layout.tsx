import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Create Your Custom Pack',
  description:
    'Build your own custom aroma pack and save with automatic volume discounts. Combine your favorite brands and sizes with discreet 24/48h shipping.',
  path: '/create-pack',
});

export default function CreatePackLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
