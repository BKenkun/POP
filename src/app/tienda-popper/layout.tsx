import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Tienda Online de Aromas y Limpiadores',
  description:
    'Tu tienda online especializada en aromas técnicos de alta pureza, nitritos de amilo, propilo y pentilo con envío discreto en 24/48h.',
  path: '/tienda-popper',
});

export default function TiendaPopperLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
