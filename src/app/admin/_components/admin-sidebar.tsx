
'use client';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart, Users, Briefcase, Ticket, Warehouse, Globe, Settings, Truck, ChevronDown, Calculator } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Catálogo', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Clientes', icon: Users },
    { href: '/admin/accounting', label: 'Contabilidad', icon: Calculator },
    { href: '/admin/b2b', label: 'B2B', icon: Briefcase },
    { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
    { href: '/admin/web', label: 'Web', icon: Globe },
    { href: '/admin/blog', label: 'Blog', icon: Newspaper },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  const logisticLinks = [
    { href: '/admin/orders', label: 'Pedidos', icon: Package },
    { href: '/admin/stock', label: 'Almacén', icon: Warehouse },
    { href: '/admin/shipping', label: 'Envíos', icon: Truck },
  ];
  
  const isLogisticsActive = logisticLinks.some(link => pathname.startsWith(link.href));
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(isLogisticsActive);


  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout();
  }

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-2">
        <Link href="/admin">
           <Logo className="h-8 group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} passHref>
                <SidebarMenuButton isActive={pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))}>
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          
           <Collapsible open={isLogisticsOpen} onOpenChange={setIsLogisticsOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isLogisticsActive} className="w-full justify-between">
                        <div className="flex items-center gap-2">
                            <Truck />
                            <span>Logística</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isLogisticsOpen && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
                <SidebarMenuSub>
                    {logisticLinks.map((link) => (
                        <SidebarMenuItem key={link.href}>
                            <Link href={link.href} passHref>
                                <SidebarMenuSubButton isActive={pathname.startsWith(link.href)}>
                                    <link.icon />
                                    <span>{link.label}</span>
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

        </SidebarMenu>
      </SidebarContent>
       <SidebarSeparator />
      <SidebarFooter className="flex flex-col gap-1">
         <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton>
                <Store />
                <span>Ver tienda</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
         <Button variant="ghost" className="justify-start w-full gap-2" onClick={handleLogout}>
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
         </Button>
      </SidebarFooter>
    </>
  );
}
