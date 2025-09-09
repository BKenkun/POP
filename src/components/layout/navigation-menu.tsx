
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
    { title: "Poppers de Amilo", composition: "Amilo" },
    { title: "Poppers de Pentilo", composition: "Pentilo" },
    { title: "Poppers de Propilo", composition: "Propilo" },
    { title: "Poppers de Butanol", composition: "Butanol" },
    { title: "Poppers al CBD", composition: "CBD" },
    { title: "Mix de Nitritos", composition: "Mix" },
];

interface NavigationMenuProps {
    onNavigate?: () => void;
}

export default function NavigationMenu({ onNavigate }: NavigationMenuProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <Link href="/products" passHref legacyBehavior>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Todos los Productos
                    </Button>
                </Link>
                <Link href="/products?size=10ml" passHref legacyBehavior>
                     <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Poppers Pequeños (10ml)
                    </Button>
                </Link>
                <Link href="/products?size=15ml" passHref legacyBehavior>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Poppers Medianos (15ml)
                    </Button>
                </Link>
                <Link href="/products?size=25ml" passHref legacyBehavior>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Poppers Grandes (25ml)
                    </Button>
                </Link>
                <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Packs de Poppers
                    </Button>
                </Link>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-between w-full">
                            <span>Composición</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-primary text-primary-foreground border-primary-foreground/20">
                        {compositionLinks.map((link) => (
                            <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref legacyBehavior>
                                <DropdownMenuItem asChild>
                                    <a className="hover:bg-accent hover:text-accent-foreground" onClick={onNavigate}>{link.title}</a>
                                </DropdownMenuItem>
                            </Link>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/products?internal_tag=accesorio" passHref legacyBehavior>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Accesorios para Poppers
                    </Button>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground justify-start w-full" onClick={onNavigate}>
                        Juguetes Eróticos
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                    Productos
                    <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-primary text-primary-foreground border-primary-foreground/20">
                <DropdownMenuLabel>Por Tamaño</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary-foreground/20"/>
                <Link href="/products?size=10ml" passHref legacyBehavior><DropdownMenuItem asChild><a className="hover:bg-accent hover:text-accent-foreground">Poppers Pequeños (10ml)</a></DropdownMenuItem></Link>
                <Link href="/products?size=15ml" passHref legacyBehavior><DropdownMenuItem asChild><a className="hover:bg-accent hover:text-accent-foreground">Poppers Medianos (15ml)</a></DropdownMenuItem></Link>
                <Link href="/products?size=25ml" passHref legacyBehavior><DropdownMenuItem asChild><a className="hover:bg-accent hover:text-accent-foreground">Poppers Grandes (25ml)</a></DropdownMenuItem></Link>
                
                <DropdownMenuSeparator className="bg-primary-foreground/20" />
                
                <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                    <DropdownMenuItem asChild><a className="hover:bg-accent hover:text-accent-foreground">Packs de Poppers</a></DropdownMenuItem>
                </Link>
                
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                        <span>Composición</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-primary text-primary-foreground border-primary-foreground/20">
                            {compositionLinks.map((link) => (
                                 <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref legacyBehavior>
                                    <DropdownMenuItem asChild>
                                        <a className="hover:bg-accent hover:text-accent-foreground">{link.title}</a>
                                    </DropdownMenuItem>
                                </Link>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-primary-foreground/20"/>
                
                <Link href="/products?internal_tag=accesorio" passHref legacyBehavior>
                    <DropdownMenuItem asChild><a className="hover:bg-accent hover:text-accent-foreground">Accesorios para Poppers</a></DropdownMenuItem>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                    <DropdownMenuItem asChild><a className="hover:bg-accent hover:text-accent-foreground">Juguetes Eróticos</a></DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
