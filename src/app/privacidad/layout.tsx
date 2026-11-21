import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Política de Privacidad y Protección de Datos',
  description:
    'Información sobre el tratamiento, protección y derechos de acceso, rectificación y supresión de tus datos personales en PuroRush.',
  path: '/privacidad',
});

export default function PrivacidadLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
