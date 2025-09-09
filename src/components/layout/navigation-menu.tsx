
'use client';

import * as React from "react";
import Link from 'next/link';
import {
  NavigationMenu as UiNavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const compositionLinks = [
    { title: "Poppers de Amilo", composition: "Amilo" },
    { title: "Poppers de Pentilo", composition: "Pentilo" },
    { title: "Poppers de Propilo", composition: "Propilo" },
    { title: "Poppers al CBD", composition: "CBD" },
    { title: "Mix de Nitritos", composition: "Mix" },
];

interface NavigationMenuProps {
    onNavigate?: () => void;
}

const NavLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a"> & { href: string }>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link href={props.href} passHref legacyBehavior>
        <NavigationMenuLink
          ref={ref}
          className={cn(
            "font-headline uppercase font-bold block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          {children}
        </NavigationMenuLink>
      </Link>
    );
  }
);
NavLink.displayName = "NavLink";


export default function NavigationMenu({ onNavigate }: NavigationMenuProps) {
    const isMobile = useIsMobile();
    const menuItemStyle = "font-headline uppercase font-bold hover:bg-accent hover:text-accent-foreground w-full text-left";

    if (isMobile) {
        return (
            <div className="flex flex-col gap-2 w-full text-primary-foreground">
                <Link href="/products" passHref legacyBehavior>
                    <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Todos los Productos
                    </Button>
                </Link>
                <Link href="/products?size=10ml" passHref legacyBehavior>
                     <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Poppers Pequeños (10ml)
                    </Button>
                </Link>
                <Link href="/products?size=15ml" passHref legacyBehavior>
                    <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Poppers Medianos (15ml)
                    </Button>
                </Link>
                <Link href="/products?size=25ml" passHref legacyBehavior>
                    <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Poppers Grandes (25ml)
                    </Button>
                </Link>
                <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                    <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Packs de Poppers
                    </Button>
                </Link>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="justify-between w-full uppercase font-bold font-headline">
                            <span>Composición</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-primary text-primary-foreground border-primary-foreground/20">
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger className={cn(menuItemStyle, "justify-between")}>
                                <span>Composición</span>
                                <ChevronRight className="h-4 w-4"/>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-56 bg-primary text-primary-foreground border-primary-foreground/20">
                                {compositionLinks.map((link) => (
                                    <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref legacyBehavior>
                                        <DropdownMenuItem asChild>
                                            <a className={menuItemStyle} onClick={onNavigate}>{link.title}</a>
                                        </DropdownMenuItem>
                                    </Link>
                                ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/products?internal_tag=accesorio" passHref legacyBehavior>
                    <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Accesorios para Poppers
                    </Button>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                    <Button variant="ghost" className="justify-start w-full uppercase font-bold font-headline" onClick={onNavigate}>
                        Juguetes Eróticos
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <UiNavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                     <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold")}>
                         <Link href="/products" legacyBehavior passHref>
                            <a>Productos</a>
                        </Link>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="w-[300px] gap-3 p-4 bg-primary text-primary-foreground">
                            <li><NavLink href="/products?size=10ml">Poppers Pequeños</NavLink></li>
                            <li><NavLink href="/products?size=15ml">Poppers Medianos</NavLink></li>
                            <li><NavLink href="/products?size=25ml">Poppers Grandes</NavLink></li>
                            <li><NavLink href="/products?internal_tag=pack">Packs de Poppers</NavLink></li>
                            <NavigationMenuItem asChild>
                                 <UiNavigationMenu>
                                     <NavigationMenuList>
                                         <NavigationMenuItem>
                                             <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold bg-transparent text-primary-foreground w-full justify-start p-3 hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground")}>
                                                 Composición
                                             </NavigationMenuTrigger>
                                             <NavigationMenuContent>
                                                 <ul className="grid w-[250px] gap-3 p-4 bg-primary text-primary-foreground">
                                                     {compositionLinks.map((link) => (
                                                         <li key={link.title}><NavLink href={`/products?composition=${encodeURIComponent(link.composition)}`} className="p-2">{link.title}</NavLink></li>
                                                     ))}
                                                 </ul>
                                             </NavigationMenuContent>
                                         </NavigationMenuItem>
                                     </NavigationMenuList>
                                 </UiNavigationMenu>
                             </NavigationMenuItem>
                             <li><NavLink href="/products?internal_tag=accesorio">Accesorios</NavLink></li>
                             <li><NavLink href="/products?internal_tag=juguete">Juguetes Eróticos</NavLink></li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </UiNavigationMenu>
    )
}
