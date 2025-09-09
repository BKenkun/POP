
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
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";


const compositionLinks = [
    { title: "POPPERS DE AMILO", composition: "Amilo" },
    { title: "POPPERS DE PENTILO", composition: "Pentilo" },
    { title: "POPPERS DE PROPILO", composition: "Propilo" },
    { title: "POPPERS DE BUTANOL", composition: "Butanol" },
    { title: "POPPERS AL CBD", composition: "CBD" },
    { title: "MIX DE NITRITOS", composition: "Mix" },
];

interface NavigationMenuProps {
    onNavigate?: () => void;
}

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link href={href} passHref legacyBehavior>
        <NavigationMenuLink 
            className="font-bold uppercase text-white hover:bg-primary/80 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors focus:bg-primary/80"
            onClick={onClick}
        >
            {children}
        </NavigationMenuLink>
    </Link>
);


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/90 focus:bg-primary/90 text-white font-bold uppercase",
            className
          )}
          {...props}
        >
          <div className="text-sm font-bold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-white/90 normal-case font-normal">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


export default function NavigationMenu({ onNavigate }: NavigationMenuProps) {
    const isMobile = useIsMobile();
    const menuItemStyle = "hover:bg-primary/80 hover:text-white text-white uppercase font-bold w-full text-left";

    if (isMobile) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <Link href="/products" passHref legacyBehavior>
                    <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
                        Todos los Productos
                    </Button>
                </Link>
                <Link href="/products?size=10ml" passHref legacyBehavior>
                     <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
                        Poppers Pequeños (10ml)
                    </Button>
                </Link>
                <Link href="/products?size=15ml" passHref legacyBehavior>
                    <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
                        Poppers Medianos (15ml)
                    </Button>
                </Link>
                <Link href="/products?size=25ml" passHref legacyBehavior>
                    <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
                        Poppers Grandes (25ml)
                    </Button>
                </Link>
                <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                    <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
                        Packs de Poppers
                    </Button>
                </Link>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-between w-full uppercase font-bold">
                            <span>Composición</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-primary text-white border-primary-foreground/20">
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger className={cn(menuItemStyle, "justify-between")}>
                                <span>Composición</span>
                                <ChevronDown className="h-4 w-4 -rotate-90"/>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-56 bg-primary text-white border-primary-foreground/20">
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
                    <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
                        Accesorios para Poppers
                    </Button>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                    <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white justify-start w-full uppercase font-bold" onClick={onNavigate}>
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
                    <NavigationMenuTrigger className="text-white hover:bg-primary/80 hover:text-white uppercase font-bold bg-transparent focus:bg-primary/80 data-[state=open]:bg-primary/80">
                         <Link href="/products" legacyBehavior passHref>
                            <a className="py-2">Productos</a>
                        </Link>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-primary">
                             <ListItem href="/products?size=10ml" title="Poppers Pequeños">
                                Botellas de 10ml, perfectas para probar.
                            </ListItem>
                            <ListItem href="/products?size=15ml" title="Poppers Medianos">
                                El tamaño más popular, 15ml de potencia.
                            </ListItem>
                             <ListItem href="/products?size=25ml" title="Poppers Grandes">
                                Formato ahorro de 25ml para los más exigentes.
                            </ListItem>
                            <ListItem href="/products?internal_tag=pack" title="Packs de Poppers">
                                Las mejores combinaciones a precios reducidos.
                            </ListItem>
                            <li className="md:col-span-1">
                                 <UiNavigationMenu className="w-full">
                                    <NavigationMenuList className="w-full">
                                        <NavigationMenuItem className="w-full">
                                            <NavigationMenuTrigger className="text-white hover:bg-primary/90 focus:bg-primary/90 hover:text-white uppercase font-bold bg-transparent w-full justify-start p-3 data-[state=open]:bg-primary/90">
                                                Composición
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[250px] gap-3 p-4 bg-primary">
                                                    {compositionLinks.map((link) => (
                                                        <ListItem key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} title={link.title} />
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </UiNavigationMenu>
                            </li>
                            <ListItem href="/products?internal_tag=accesorio" title="Accesorios">
                                Inhaladores, máscaras y todo lo que necesitas.
                            </ListItem>
                             <ListItem href="/products?internal_tag=juguete" title="Juguetes Eróticos">
                                Explora nuevas sensaciones.
                            </ListItem>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </UiNavigationMenu>
    )
}
