
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export function Footer() {
  const { isAdmin } = useAuth();

  const allLinks = [
    { href: '/informacion-legal', text: 'Información legal' },
    { href: '/terminos-y-condiciones', text: 'Termos y Condiciones Generales' },
    { href: '/venta-popper', text: 'Venta de Popper' },
    { href: '/pagos-seguros', text: 'Pagos seguros' },
    { href: '/popper-info', text: 'Popper todo lo que debes saber' },
    { href: '/leather-cleaners-info', text: 'Leather Cleaners Información' },
    { href: '/tienda-popper', text: 'Tienda Popper' },
    { href: '/privacidad', text: 'Privacidad y protección de datos' },
    { href: '/resolucion-litigios', text: 'Resolución de contratos y de litigios' },
    { href: '/politica-cookies', text: 'Política de cookies' },
    { href: '/envio-tarifas', text: 'Envío y tarifas' },
    { href: '/contacto', text: 'Contacte con nosotros' },
    { href: '/blog', text: 'Blog' },
  ];

  if (isAdmin) {
    allLinks.push({ href: '/site-documentation', text: 'Docs del Sitio' });
  }

  const LinkColumn = ({ title, links }: { title: string; links: { href: string; text: string }[] }) => (
    <div>
      <h4 className="font-semibold text-base mb-3 text-foreground/90">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-border/40 mt-12 pt-8 pb-6">
      <div className="container">
        <div className="mb-8">
          <p className="text-sm text-center md:text-left text-muted-foreground mb-6">
            <span className="font-bold text-foreground">Popper Online:</span> Tu tienda de confianza para aromas de calidad superior.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <LinkColumn title="Información" links={allLinks.slice(0, 4)} />
            <LinkColumn title="Guías" links={allLinks.slice(4, 7)} />
            <LinkColumn title="Legal" links={allLinks.slice(7, 11)} />
            <LinkColumn title="Ayuda" links={allLinks.slice(11)} />
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
