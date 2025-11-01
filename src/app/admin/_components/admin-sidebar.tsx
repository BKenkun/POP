
'use client';

import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart, Users, Briefcase, Ticket, Warehouse, Globe, Settings, Truck, Calculator, Landmark, ChevronDown, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';


export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  
  const isLogisticsActive = pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/stock') || pathname.startsWith('/admin/shipping');
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(isLogisticsActive);

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { 
        isCollapsible: true,
        label: 'Logística',
        icon: Landmark,
        isOpen: isLogisticsOpen,
        onOpenChange: setIsLogisticsOpen,
        isActive: isLogisticsActive,
        subLinks: [
            { href: '/admin/orders', label: 'Pedidos', icon: Package },
            { href: '/admin/stock', label: 'Almacén', icon: Warehouse },
            { href: '/admin/shipping', label: 'Envíos', icon: Truck },
        ]
    },
    { href: '/admin/products', label: 'Catálogo', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Clientes', icon: Users },
    { href: '/admin/accounting', label: 'Contabilidad', icon: Calculator },
    { href: '/admin/b2b', label: 'B2B', icon: Briefcase },
    { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
    { href: '/admin/web', label: 'Web', icon: Globe },
    { href: '/admin/blog', label: 'Blog', icon: Newspaper },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout();
  }

  return (
    <div className="flex flex-col h-full">
       <div className="flex h-[60px] items-center justify-between border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
           <Logo className="h-8 w-auto" />
        </Link>
         <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={toggleSidebar}>
            <PanelLeft className={cn("h-5 w-5 transition-transform", state === 'collapsed' && 'rotate-180')} />
            <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map((link) => (
            link.isCollapsible ? (
                <Collapsible key={link.label} open={link.isOpen} onOpenChange={link.onOpenChange}>
                    <CollapsibleTrigger asChild>
                         <div
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer',
                                link.isActive && 'bg-muted text-primary'
                            )}
                            >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-7 pt-1">
                        <nav className="grid gap-1">
                            {link.subLinks.map(subLink => (
                                 <Link
                                    key={subLink.href}
                                    href={subLink.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                                        pathname === subLink.href ? 'bg-muted text-primary' : ''
                                    }`}
                                >
                                    <subLink.icon className="h-4 w-4" />
                                    {subLink.label}
                                </Link>
                            ))}
                        </nav>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    pathname === link.href ? 'bg-muted text-primary' : ''
                }`}
                >
                <link.icon className="h-4 w-4" />
                {link.label}
                </Link>
            )
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/" target="_blank">
                <Store className="mr-2" />
                Ver tienda
            </Link>
         </Button>
         <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Cerrar Sesión
         </Button>
      </div>
    </div>
  );
}
