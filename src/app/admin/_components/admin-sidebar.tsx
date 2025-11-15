
'use client';

import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart, Users, Briefcase, Ticket, Warehouse, Globe, Settings, Truck, Calculator, Landmark, ChevronDown, PanelLeft, Bitcoin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  
  const isLogisticsActive = pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/stock') || pathname.startsWith('/admin/shipping');
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(isLogisticsActive);
  
  const isCollapsed = state === 'collapsed';

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
    { href: '/admin/pos-crypto', label: 'TPV Cripto', icon: Bitcoin },
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

  const renderCollapsibleLink = (link: any) => {
    if (isCollapsed) {
        return (
            <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer',
                            link.isActive && 'bg-muted text-primary',
                            'justify-center'
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p className="font-semibold mb-2">{link.label}</p>
                    <nav className="grid gap-1">
                        {link.subLinks.map((subLink: any) => (
                            <Link
                                key={subLink.href}
                                href={subLink.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-primary text-sm",
                                    pathname === subLink.href && "text-primary bg-muted"
                                )}
                            >
                                <subLink.icon className="h-4 w-4" />
                                {subLink.label}
                            </Link>
                        ))}
                    </nav>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Collapsible key={link.label} open={link.isOpen && !isCollapsed} onOpenChange={link.onOpenChange} disabled={isCollapsed}>
            <CollapsibleTrigger asChild>
                 <div
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer',
                        link.isActive && 'bg-muted text-primary',
                        isCollapsed && "justify-center"
                    )}
                    >
                    <link.icon className="h-4 w-4" />
                    {!isCollapsed && (
                        <>
                            {link.label}
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </>
                    )}
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-7 pt-1">
                <nav className="grid gap-1">
                    {link.subLinks.map((subLink: any) => (
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
    );
};

  return (
    <div className="flex flex-col h-full">
       <div className={cn(
           "flex h-[60px] items-center border-b",
           isCollapsed ? "justify-center" : "px-4"
       )}>
        {!isCollapsed && (
             <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <Logo className="h-8 w-auto" />
             </Link>
        )}
         <Button variant="ghost" size="icon" className={cn("hidden lg:flex", !isCollapsed && "ml-auto")} onClick={toggleSidebar}>
            <PanelLeft className={cn("h-5 w-5 transition-transform", isCollapsed && 'rotate-180')} />
            <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map((link) => (
            link.isCollapsible ? (
                renderCollapsibleLink(link)
            ) : (
                <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                         <Link
                            href={link.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                pathname === link.href && 'bg-muted text-primary',
                                isCollapsed && 'justify-center'
                            )}
                            >
                            <link.icon className="h-4 w-4" />
                            {!isCollapsed && link.label}
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right">
                            {link.label}
                        </TooltipContent>
                    )}
                </Tooltip>
            )
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "justify-center")} asChild>
            <Link href="/" target="_blank">
                <Store className={cn("mr-2", isCollapsed && "mr-0")} />
                {!isCollapsed && "Ver tienda"}
            </Link>
         </Button>
         <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "justify-center")} onClick={handleLogout}>
            <LogOut className={cn("mr-2", isCollapsed && "mr-0")} />
            {!isCollapsed && "Cerrar Sesión"}
         </Button>
      </div>
    </div>
  );
}
