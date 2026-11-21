import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Leather Cleaners Information & Specifications',
  description:
    'Technical specifications, responsible use policies, safety guidelines, and discreet logistics for our professional leather cleaner formulas.',
  path: '/leather-cleaners-info',
});

export default function LeatherCleanersInfoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
