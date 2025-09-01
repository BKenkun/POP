'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

    const linksCol1 = footerLinks.slice(0, 5);
    const linksCol2 = footerLinks.slice(5, 10);
    const linksCol3 = footerLinks.slice(10);

    const LinkList = ({ links }: { links: { href: string; text: string }[] }) => (
        <ul className="space-y-2 pt-2">
            {links.map(link => (
                <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.text}
                    </Link>
                </li>
            ))}
        </ul>
    );

    const AccordionFooter = () => (
        <Accordion type="multiple" className="w-full md:col-span-3">
            <AccordionItem value="info">
                <AccordionTrigger className="font-semibold text-base text-foreground">Información</AccordionTrigger>
                <AccordionContent>
                    <LinkList links={linksCol1} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="legal">
                <AccordionTrigger className="font-semibold text-base text-foreground">Legal</AccordionTrigger>
                <AccordionContent>
                    <LinkList links={linksCol2} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="help">
                <AccordionTrigger className="font-semibold text-base text-foreground">Ayuda</AccordionTrigger>
                <AccordionContent>
                    <LinkList links={linksCol3} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );

    return (
      <footer className="border-t border-border/40 mt-16 pt-12 pb-8">
        <div className="container pr-24">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-1">
                     <h3 className="font-bold text-lg mb-2 text-foreground">Popper España</h3>
                     <p className="text-sm text-muted-foreground">Tu tienda de confianza para aromas de calidad superior.</p>
                </div>
                <div className="md:col-span-3">
                    <AccordionFooter />
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