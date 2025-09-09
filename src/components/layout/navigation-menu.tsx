
'use client';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
  

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
                        {compositionLinks.map((link) => (
                            <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref legacyBehavior>
                                <DropdownMenuItem asChild>
                                    <a className={menuItemStyle} onClick={onNavigate}>{link.title}</a>
                                </DropdownMenuItem>
                            </Link>
                        ))}
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-primary/80 hover:text-white uppercase font-bold">
                    Productos
                    <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-primary text-white border-primary-foreground/20 p-2 space-y-1">
                <DropdownMenuLabel className="uppercase font-bold text-white">Por Tamaño</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary-foreground/20"/>
                <Link href="/products?size=10ml" passHref legacyBehavior><DropdownMenuItem asChild><a className={menuItemStyle}>Poppers Pequeños (10ml)</a></DropdownMenuItem></Link>
                <Link href="/products?size=15ml" passHref legacyBehavior><DropdownMenuItem asChild><a className={menuItemStyle}>Poppers Medianos (15ml)</a></DropdownMenuItem></Link>
                <Link href="/products?size=25ml" passHref legacyBehavior><DropdownMenuItem asChild><a className={menuItemStyle}>Poppers Grandes (25ml)</a></DropdownMenuItem></Link>
                
                <DropdownMenuSeparator className="bg-primary-foreground/20" />
                
                <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                    <DropdownMenuItem asChild><a className={menuItemStyle}>Packs de Poppers</a></DropdownMenuItem>
                </Link>
                
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="hover:bg-primary/80 focus:bg-primary/80 data-[state=open]:bg-primary/80 text-white uppercase font-bold w-full">
                        <span>Composición</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-primary text-white border-primary-foreground/20 p-2 space-y-1 w-56">
                            {compositionLinks.map((link) => (
                                 <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref legacyBehavior>
                                    <DropdownMenuItem asChild>
                                        <a className={menuItemStyle}>{link.title}</a>
                                    </DropdownMenuItem>
                                </Link>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-primary-foreground/20"/>
                
                <Link href="/products?internal_tag=accesorio" passHref legacyBehavior>
                    <DropdownMenuItem asChild><a className={menuItemStyle}>Accesorios para Poppers</a></DropdownMenuItem>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                    <DropdownMenuItem asChild><a className={menuItemStyle}>Juguetes Eróticos</a></DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
