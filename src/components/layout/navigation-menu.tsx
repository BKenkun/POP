'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
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
import { cn } from '@/lib/utils';

const compositionLinks = [
  { title: 'POPPERS DE AMILO', composition: 'Amilo' },
  { title: 'POPPERS DE PENTILO', composition: 'Pentilo' },
  { title: 'POPPERS DE PROPILO', composition: 'Propilo' },
  { title: 'POPPERS AL CBD', composition: 'CBD' },
  { title: 'MIX DE NITRITOS', composition: 'Mix' },
];

interface NavigationMenuProps {
  onNavigate?: () => void;
}

export default function NavigationMenuComponent({ onNavigate }: NavigationMenuProps) {

  const navLinkStyles = cn(
    "font-headline uppercase font-bold w-full text-left p-2 rounded-md text-sm",
    "bg-transparent text-primary-foreground",
    "hover:bg-accent hover:text-accent-foreground",
    "focus:bg-accent focus:text-accent-foreground",
    "transition-colors duration-200"
  );

  const subTriggerStyles = cn(
    navLinkStyles,
    "flex justify-between items-center"
  );
  
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger 
             className={cn(
              navigationMenuTriggerStyle(),
              'font-headline uppercase font-bold bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
            )}
          >
             <Link href="/products" passHref legacyBehavior>
                <a onClick={onNavigate}>PRODUCTOS</a>
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
             <div className="p-2 w-64 bg-primary border-primary-foreground/20">
                <ul className="flex flex-col gap-1">
                     <li>
                        <Link href="/products?size=10ml" passHref legacyBehavior>
                           <a onClick={onNavigate} className={navLinkStyles}>
                                POPPERS PEQUEÑOS (10ML)
                           </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/products?size=15ml" passHref legacyBehavior>
                             <a onClick={onNavigate} className={navLinkStyles}>
                                POPPERS MEDIANOS (15ML)
                             </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/products?size=25ml" passHref legacyBehavior>
                             <a onClick={onNavigate} className={navLinkStyles}>
                                POPPERS GRANDES (25ML)
                             </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/products?internal_tag=pack" passHref legacyBehavior>
                            <a onClick={onNavigate} className={navLinkStyles}>
                                PACKS DE POPPERS
                            </a>
                        </Link>
                    </li>
                    <li>
                        <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <button className={subTriggerStyles}>
                                    <span>COMPOSICIÓN</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                sideOffset={10} 
                                alignOffset={-5}
                                className="bg-primary border-primary-foreground/20 text-primary-foreground w-56"
                            >
                                {compositionLinks.map((link) => (
                                    <DropdownMenuItem key={link.title} asChild className={cn(navLinkStyles, 'p-2')}>
                                        <Link href={`/products?composition=${encodeURIComponent(link.composition)}`} onClick={onNavigate}>
                                            {link.title}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                    <li>
                        <Link href="/products?internal_tag=accesorio" passHref legacyBehavior>
                            <a onClick={onNavigate} className={navLinkStyles}>
                                ACCESORIOS PARA POPPERS
                            </a>
                        </Link>
                    </li>
                     <li>
                        <Link href="/products?internal_tag=juguete" passHref legacyBehavior>
                           <a onClick={onNavigate} className={navLinkStyles}>
                                JUGUETES ERÓTICOS
                           </a>
                        </Link>
                    </li>
                </ul>
             </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}