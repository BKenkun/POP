'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isAdminPath = pathname.startsWith('/admin');

    // Hide footer on admin login page
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

    const linksCol1 = footerLinks.slice(0, 5);
    const linksCol2 = footerLinks.slice(5, 10);
    const linksCol3 = footerLinks.slice(10);


    return (
      <footer className="border-t border-border/40 mt-16 pt-12 pb-8">
        <div className="container pr-24">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-1">
                     <h3 className="font-bold text-lg text-primary-foreground mb-2">Popper España</h3>
                     <p className="text-sm text-muted-foreground">Tu tienda de confianza para aromas de calidad superior.</p>
                </div>
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
                    <div>
                        <h4 className="font-semibold text-base text-foreground mb-3">Información</h4>
                        <ul className="space-y-2">
                            {linksCol1.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-base text-foreground mb-3">Legal</h4>
                        <ul className="space-y-2">
                            {linksCol2.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-base text-foreground mb-3">Ayuda</h4>
                        <ul className="space-y-2">
                            {linksCol3.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
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