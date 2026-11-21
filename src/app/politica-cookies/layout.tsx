import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Política de Cookies',
  description:
    'Detalle sobre las cookies técnicas, analíticas y de preferencias utilizadas en PuroRush y cómo gestionarlas desde tu navegador.',
  path: '/politica-cookies',
});

export default function PoliticaCookiesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
