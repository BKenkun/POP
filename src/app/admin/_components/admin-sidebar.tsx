'use client';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  
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
            <Link href="/admin/new-post" passHref>
              <SidebarMenuButton isActive={pathname === '/admin/new-post'}>
                <Newspaper />
                <span>New Post</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Link href="/admin/login" passHref>
             <Button variant="ghost" className="justify-start w-full gap-2">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
             </Button>
        </Link>
      </SidebarFooter>
    </>
  );
}
