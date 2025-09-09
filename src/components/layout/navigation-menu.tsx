
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
    { title: "POPPERS DE AMILO", composition: "Amilo" },
    { title: "POPPERS DE PENTILO", composition: "Pentilo" },
    { title: "POPPERS DE PROPILO", composition: "Propilo" },
    { title: "POPPERS AL CBD", composition: "CBD" },
    { title: "MIX DE NITRITOS", composition: "Mix" },
];

interface NavigationMenuProps {
    onNavigate?: () => void;
}

const NavLink = ({ href, children, onClick, className }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string; }) => (
    <Link href={href} passHref legacyBehavior>
        <NavigationMenuLink 
            className={cn("font-bold uppercase text-white hover:bg-primary/80 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors focus:bg-primary/80", className)}
            onClick={onClick}
        >
            {children}
        </NavigationMenuLink>
    </Link>
);

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
                                <ChevronRight className="h-4 w-4"/>
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
                        <ul className="w-[300px] gap-3 p-4 bg-primary text-white">
                            <li><NavLink href="/products?size=10ml">Poppers Pequeños</NavLink></li>
                            <li><NavLink href="/products?size=15ml">Poppers Medianos</NavLink></li>
                            <li><NavLink href="/products?size=25ml">Poppers Grandes</NavLink></li>
                            <li><NavLink href="/products?internal_tag=pack">Packs de Poppers</NavLink></li>
                            <li>
                                 <UiNavigationMenu>
                                    <NavigationMenuList>
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger className="text-white hover:bg-primary/90 focus:bg-primary/90 hover:text-white uppercase font-bold bg-transparent w-full justify-start p-3 data-[state=open]:bg-primary/90">
                                                Composición
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[250px] gap-3 p-4 bg-primary">
                                                    {compositionLinks.map((link) => (
                                                        <li key={link.title}><NavLink href={`/products?composition=${encodeURIComponent(link.composition)}`} className="p-2">{link.title}</NavLink></li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </UiNavigationMenu>
                            </li>
                             <li><NavLink href="/products?internal_tag=accesorio">Accesorios</NavLink></li>
                             <li><NavLink href="/products?internal_tag=juguete">Juguetes Eróticos</NavLink></li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </UiNavigationMenu>
    )
}
