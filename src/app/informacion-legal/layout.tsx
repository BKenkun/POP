import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Información Legal y Aviso de Uso',
  description:
    'Datos identificativos del titular, registro comercial, advertencias de uso técnico responsable y política de cancelación de pedidos de PuroRush.',
  path: '/informacion-legal',
});

export default function InformacionLegalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
