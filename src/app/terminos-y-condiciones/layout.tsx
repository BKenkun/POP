import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Términos y Condiciones de Uso',
  description:
    'Consulta los términos y condiciones generales de compra, edad mínima (+18), envíos, programa de fidelización y uso responsable en PuroRush.',
  path: '/terminos-y-condiciones',
});

export default function TerminosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
