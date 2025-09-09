
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { SearchForm } from './search-form';
import { PackageCheck, Truck } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { SidebarHeader, SidebarContent, SidebarMenu } from '../ui/sidebar';
import { Logo } from '../logo';
import NavigationMenuComponent from "./navigation-menu";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }
  
  const MobileNav = () => (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary/80">
            <Menu className="text-primary-foreground"/>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-primary text-primary-foreground p-0">
          <SidebarHeader className="p-2 border-b border-primary-foreground/20">
             <Link href="/" className="flex items-center space-x-2 group" onClick={() => setIsOpen(false)}>
                <Logo />
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="flex flex-col gap-2 p-2">
              <NavigationMenuComponent onNavigate={() => setIsOpen(false)} />
              <SearchForm onSearch={() => setIsOpen(false)} />
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
        <div className="flex items-center justify-end gap-x-1 sm:gap-x-4 text-xs font-bold text-primary-foreground">
           <div className="hidden sm:flex items-center gap-2 font-headline text-primary-foreground">
                <PackageCheck className="h-4 w-4 text-primary-foreground" />
                <span>Envío GRATIS +40€</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 font-headline text-primary-foreground">
                <Truck className="h-4 w-4 text-primary-foreground" />
                <span>Entrega 24/48h</span>
            </div>
            <div className="md:hidden">
                <MobileNav />
            </div>
        </div>
      </div>
    </header>
  );
}
