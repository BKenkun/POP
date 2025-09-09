
'use client';

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { ChevronRight } from 'lucide-react';
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

export default function NavigationMenu({ onNavigate }: NavigationMenuProps) {
    const pathname = usePathname();
    const isProductsPage = pathname.startsWith('/products');

    const triggerStyles = cn(
        "font-headline uppercase font-bold text-primary-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        "transition-colors duration-200"
    );

    const itemStyles = cn(
        "font-headline uppercase font-bold text-primary-foreground",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "cursor-pointer"
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className={triggerStyles}>
                    <Link href="/products">
                        PRODUCTOS
                    </Link>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="bg-primary border-primary-foreground/20 text-primary-foreground w-64"
                sideOffset={10}
            >
                <Link href="/products?size=10ml" passHref>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        POPPERS PEQUEÑOS (10ML)
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?size=15ml" passHref>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        POPPERS MEDIANOS (15ML)
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?size=25ml" passHref>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        POPPERS GRANDES (25ML)
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?internal_tag=pack" passHref>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        PACKS DE POPPERS
                    </DropdownMenuItem>
                </Link>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className={itemStyles}>
                        <span>COMPOSICIÓN</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent 
                            className="bg-primary border-primary-foreground/20 text-primary-foreground w-56"
                            sideOffset={8}
                        >
                            {compositionLinks.map((link) => (
                                <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref>
                                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                                        {link.title}
                                    </DropdownMenuItem>
                                </Link>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <Link href="/products?internal_tag=accesorio" passHref>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        ACCESORIOS PARA POPPERS
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        JUGUETES ERÓTICOS
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
