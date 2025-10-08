
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { SearchForm } from './search-form';
import { PackageCheck, Truck } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { SidebarHeader, SidebarContent, SidebarMenu } from '../ui/sidebar';
import { Logo } from '../logo';
import NavigationMenuComponent from "./navigation-menu";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // No renderizar el header en las rutas de admin
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  const MobileNav = () => (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary/90">
            <Menu className="text-primary-foreground"/>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-primary text-primary-foreground p-0">
           <SheetTitle className="sr-only">Menú de Navegación Principal</SheetTitle>
          <SidebarHeader className="p-2 border-b border-primary-foreground/20">
             <Link href="/" className="flex items-center space-x-2 group" onClick={() => setIsOpen(false)}>
                <Logo />
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="flex flex-col gap-2 p-2">
              <NavigationMenuComponent onNavigate={() => setIsOpen(false)} isMobile={true} />
            </SidebarMenu>
          </SidebarContent>
        </SheetContent>
      </Sheet>
  )

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-white shadow-md font-headline">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-x-4">
             <div className="md:hidden">
                 <Link href="/" className="flex items-center">
                    <Logo />
                  </Link>
            </div>
            <div className="hidden md:flex items-center gap-x-4">
                <Link href="/" className="flex items-center">
                    <Logo />
                </Link>
                <NavigationMenuComponent />
                <SearchForm />
            </div>
        </div>
        <div className="flex items-center justify-end gap-x-2 sm:gap-x-3 text-xs text-primary-foreground">
           <div className="hidden sm:flex items-center gap-1.5 font-body text-[10px] font-medium text-primary-foreground">
                <PackageCheck className="h-3 w-3 text-primary-foreground" />
                <span>GRATIS +40€</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-body text-[10px] font-medium text-primary-foreground">
                <Truck className="h-3 w-3 text-primary-foreground" />
                <span>24/48h</span>
            </div>
            <div className="md:hidden">
                <MobileNav />
            </div>
        </div>
      </div>
    </header>
  );
}
