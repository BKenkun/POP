import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Resolución de Litigios y Desistimiento',
  description:
    'Información sobre el derecho de desistimiento, exclusiones sanitarias, legislación aplicable y acceso a la plataforma europea de resolución de litigios (ODR).',
  path: '/resolucion-litigios',
});

export default function ResolucionLitigiosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
