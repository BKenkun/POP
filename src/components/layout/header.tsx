
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { SearchForm } from './search-form';
import { PackageCheck, Truck } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { SidebarHeader, SidebarContent, SidebarMenu } from '../ui/sidebar';
import { Logo } from '../logo';

export function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }
  
  const navLinks = (
    <>
      <Button variant="ghost" asChild className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start">
        <Link href="/products" onClick={() => setIsOpen(false)}>
            Productos
        </Link>
      </Button>
       <SearchForm onSearch={() => setIsOpen(false)} />
    </>
  )

  const DesktopNav = () => (
     <nav className="hidden md:flex items-center gap-2">
        {navLinks}
     </nav>
  )

  const MobileNav = () => (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-primary text-primary-foreground p-0">
          <SidebarHeader className="p-2 border-b border-primary-foreground/20">
             <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <Logo className="h-10 w-auto" />
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="flex flex-col gap-2 p-2">
              {navLinks}
            </SidebarMenu>
          </SidebarContent>
        </SheetContent>
      </Sheet>
  )

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-10 w-auto" />
          </Link>
          <DesktopNav />
        </div>
        <div className="flex items-center justify-end gap-x-1 sm:gap-x-4 text-xs font-medium">
           <div className="hidden sm:flex items-center gap-2">
                <PackageCheck className="h-4 w-4" />
                <span>Envío GRATIS +40€</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Entrega 24/48h</span>
            </div>
            <MobileNav />
        </div>
      </div>
    </header>
  );
}
