import type { ReactNode } from 'react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Contacto y Atención al Cliente',
  description:
    '¿Tienes dudas sobre tu pedido o nuestros productos? Contacta con el equipo de soporte de PuroRush por correo o formulario con respuesta en menos de 24 horas.',
  path: '/contacto',
});

export default function ContactoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
