import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Venta de Aromas y Fórmulas Técnicas',
  description:
    'Compara fórmulas de nitrito de amilo, propilo y pentilo. Información técnica, aplicaciones profesionales, precios competitivos y envío exprés.',
  path: '/venta-popper',
});

export default function VentaPopperLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
