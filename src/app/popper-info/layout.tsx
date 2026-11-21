import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Información Técnica sobre Aromas y Nitritos',
  description:
    'Guía informativa sobre propiedades técnicas, almacenamiento seguro, advertencias de manipulación y diferencias entre nitritos de amilo, pentilo y propilo.',
  path: '/popper-info',
});

export default function PopperInfoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
