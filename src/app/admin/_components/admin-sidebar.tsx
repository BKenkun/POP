
'use client';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart, Users, Briefcase, Ticket, Warehouse, Globe, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { logout } from '@/app/actions/admin-auth';

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Catálogo', icon: ShoppingCart },
    { href: '/admin/orders', label: 'Pedidos', icon: Package },
    { href: '/admin/customers', label: 'Clientes', icon: Users },
    { href: '/admin/b2b', label: 'B2B', icon: Briefcase },
    { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
    { href: '/admin/stock', label: 'Almacén', icon: Warehouse },
    { href: '/admin/web', label: 'Web', icon: Globe },
    { href: '/admin/blog', label: 'Blog', icon: Newspaper },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-2">
        <Link href="/admin">
           <Logo className="h-8 group-data-[collapsible=icon]:hidden" />
        </Link>
        {/* This trigger is visible when the sidebar is expanded */}
        <div className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
            <SidebarTrigger />
        </div>
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
         <form action={logout}>
            <Button variant="ghost" className="justify-start w-full gap-2" type="submit">
                <LogOut />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
         </form>
      </SidebarFooter>
    </>
  );
}
