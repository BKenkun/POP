import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Monthly Dose Club Subscription',
  description:
    'Join the PuroRush Monthly Dose Club for curated monthly aromas, exclusive accessories, and surprise gifts delivered discreetly to your door.',
  path: '/subscription',
});

export default function SubscriptionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
