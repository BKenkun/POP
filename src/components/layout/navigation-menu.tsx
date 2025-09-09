
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
    { title: "Poppers de Amilo", composition: "Amilo" },
    { title: "Poppers de Pentilo", composition: "Pentilo" },
    { title: "Poppers de Propilo", composition: "Propilo" },
    { title: "Poppers al CBD", composition: "CBD" },
    { title: "Mix de Nitritos", composition: "Mix" },
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
                    <Link href="/products" legacyBehavior passHref>
                        <a>Productos</a>
                    </Link>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="bg-primary border-primary-foreground/20 text-primary-foreground w-64"
                sideOffset={10}
            >
                <Link href="/products?size=10ml" passHref legacyBehavior>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        Poppers Pequeños (10ml)
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?size=15ml" passHref legacyBehavior>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        Poppers Medianos (15ml)
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?size=25ml" passHref legacyBehavior>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        Poppers Grandes (25ml)
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        Packs de Poppers
                    </DropdownMenuItem>
                </Link>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className={itemStyles}>
                        <span>Composición</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent 
                            className="bg-primary border-primary-foreground/20 text-primary-foreground w-56"
                            sideOffset={8}
                        >
                            {compositionLinks.map((link) => (
                                <Link key={link.title} href={`/products?composition=${encodeURIComponent(link.composition)}`} passHref legacyBehavior>
                                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                                        {link.title}
                                    </DropdownMenuItem>
                                </Link>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <Link href="/products?internal_tag=accesorio" passHref legacyBehavior>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        Accesorios para Poppers
                    </DropdownMenuItem>
                </Link>
                <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                    <DropdownMenuItem className={itemStyles} onClick={onNavigate}>
                        Juguetes Eróticos
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
