'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

export function Footer() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();

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
            <span className="font-bold text-foreground">PuroRush:</span> {t('footer.slogan')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <LinkColumn title={t('footer.column_info')} links={[
                { href: '/informacion-legal', text: t('footer.link_legal_info') },
                { href: '/terminos-y-condiciones', text: t('footer.link_terms') },
                { href: '/venta-popper', text: t('footer.link_popper_sale') },
                { href: '/pagos-seguros', text: t('footer.link_secure_payments') },
            ]} />
            <LinkColumn title={t('footer.column_guides')} links={[
                { href: '/popper-info', text: t('footer.link_popper_info') },
                { href: '/leather-cleaners-info', text: t('footer.link_leather_cleaners') },
                { href: '/tienda-popper', text: t('footer.link_popper_shop') },
            ]} />
            <LinkColumn title={t('footer.column_legal')} links={[
                { href: '/privacidad', text: t('footer.link_privacy') },
                { href: '/resolucion-litigios', text: t('footer.link_disputes') },
                { href: '/politica-cookies', text: t('footer.link_cookies') },
                { href: '/shipping', text: t('footer.link_shipping') },
            ]} />
            <LinkColumn title={t('footer.column_help')} links={[
                { href: '/contacto', text: t('footer.link_contact') },
                { href: '/blog', text: t('footer.link_blog') },
                ...(isAdmin ? [{ href: '/site-documentation', text: t('footer.link_docs') }] : []),
            ]} />
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} PuroRush. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
