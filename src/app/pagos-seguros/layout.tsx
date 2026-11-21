import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Pagos Seguros y Discretos',
  description:
    'Métodos de pago seguros y 100% discretos: contrareembolso, tarjeta cifrada y pagos móviles sin referencias en tu extracto bancario.',
  path: '/pagos-seguros',
});

export default function PagosSegurosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
