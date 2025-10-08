
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
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  
  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-2">
        <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
          Admin Panel
        </h2>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin" passHref>
              <SidebarMenuButton isActive={pathname === '/admin'}>
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/orders" passHref>
              <SidebarMenuButton isActive={pathname.startsWith('/admin/orders')}>
                <Package />
                <span>Pedidos</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/admin/products" passHref>
              <SidebarMenuButton isActive={pathname.startsWith('/admin/products')}>
                <ShoppingCart />
                <span>Productos</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/new-post" passHref>
              <SidebarMenuButton isActive={pathname === '/admin/new-post'}>
                <Newspaper />
                <span>New Post</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton>
                <Store />
                <span>Back to Shop</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
       <SidebarSeparator />
      <SidebarFooter>
         <Button variant="ghost" className="justify-start w-full gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
         </Button>
      </SidebarFooter>
    </>
  );
}
