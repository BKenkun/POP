'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isAdminPath = pathname.startsWith('/admin');

    if (isAdminPath && pathname.includes('/login')) {
      return null;
    }
    
    const footerLinks = [
        { href: "/informacion-legal", text: "Información legal" },
        { href: "/terminos-y-condiciones", text: "Termos y Condiciones Generales" },
        { href: "/venta-popper", text: "Venta Popper" },
        { href: "/pagos-seguros", text: "Pagos seguros" },
        { href: "/popper-info", text: "Popper todo lo que debes saber" },
        { href: "/leather-cleaners-info", text: "Leather Cleaners Información" },
        { href: "/tienda-popper", text: "Tienda Popper" },
        { href: "/privacidad", text: "Privacidad y protección de datos" },
        { href: "/resolucion-litigios", text: "Resolución de contratos y de litigios" },
        { href: "/politica-cookies", text: "Política de cookies" },
        { href: "/envio-tarifas", text: "Envío y tarifas" },
        { href: "/contacto", text: "Contacte con nosotros" },
        { href: "/blog", text: "Blog" }
    ];

    const LinkColumn = ({ title, links }: { title: string; links: { href: string; text: string }[] }) => (
        <div>
            <h4 className="font-semibold text-base mb-3 text-foreground">{title}</h4>
            <ul className="space-y-2">
                {links.map(link => (
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
      <footer className="border-t border-border/40 mt-16 pt-10 pb-8">
        <div className="container pr-24">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-1">
                     <h3 className="font-bold text-lg mb-2 text-foreground">Popper España</h3>
                     <p className="text-sm text-muted-foreground">Tu tienda de confianza para aromas de calidad superior.</p>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                   <LinkColumn title="Información" links={footerLinks.slice(0, 5)} />
                   <LinkColumn title="Legal" links={footerLinks.slice(5, 10)} />
                   <LinkColumn title="Ayuda" links={footerLinks.slice(10)} />
                </div>
            </div>

            <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                &copy; {new Date().getFullYear()} Popper España. T
                {pathname.startsWith('/blog') ? (
                    <Link href="/admin/login" className="hover:text-primary">o</Link>
                ) : (
                    'o'
                )}
                dos los derechos reservados.
                </p>
                {isAdminPath && (
                     <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">
                        Admin Panel
                    </Link>
                )}
            </div>
        </div>
      </footer>
    );
}