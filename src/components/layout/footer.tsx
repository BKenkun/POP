'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function Footer() {
    const pathname = usePathname();
    const { user } = useAuth();

    // No renderizar el footer en las rutas de admin.
    if (pathname.startsWith('/admin') || pathname.startsWith('/verify') || pathname.startsWith('/positive')) {
      return null;
    }
    
    const footerLinks = [
        { href: "/informacion-legal", text: "Información legal" },
        { href: "/terminos-y-condiciones", text: "Termos y Condiciones Generales" },
        { href: "/venta-popper", text: "Venta de Popper" },
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
            <h4 className="font-semibold text-base mb-3 text-foreground/90">{title}</h4>
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
      <footer className="border-t border-border/40 mt-12 pt-8 pb-6">
        <div className="container">
            <div className="mb-8">
                <p className="text-sm text-center md:text-left text-muted-foreground mb-6">
                    <span className="font-bold text-foreground">Popper Online:</span> Tu tienda de confianza para aromas de calidad superior.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                   <LinkColumn title="Información" links={footerLinks.slice(0, 5)} />
                   <LinkColumn title="Legal" links={footerLinks.slice(5, 10)} />
                   <LinkColumn title="Ayuda" links={footerLinks.slice(10)} />
                </div>
            </div>

            <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                &copy; {new Date().getFullYear()} Popper Online. Todos los derechos reservados.
                </p>
            </div>
        </div>
      </footer>
    );
}
