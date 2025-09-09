'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

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
    "transition-colors duration-200 flex items-center justify-between"
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger 
             className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground")}
          >
             <Link href="/products" onClick={onNavigate}>
                PRODUCTOS
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
             <ul className="flex flex-col p-2 w-64 bg-primary text-primary-foreground border-r border-primary-foreground/20">
                 <ListItem href="/products?size=10ml" title="POPPERS PEQUEÑOS (10ML)" onNavigate={onNavigate} />
                 <ListItem href="/products?size=15ml" title="POPPERS MEDIANOS (15ML)" onNavigate={onNavigate} />
                 <ListItem href="/products?size=25ml" title="POPPERS GRANDES (25ML)" onNavigate={onNavigate} />
                 <ListItem href="/products?internal_tag=pack" title="PACKS DE POPPERS" onNavigate={onNavigate} />
                 <ListItem href="/products?internal_tag=accesorio" title="ACCESORIOS PARA POPPERS" onNavigate={onNavigate} />
                 <ListItem href="/products?internal_tag=juguete" title="JUGUETES ERÓTICOS" onNavigate={onNavigate} />
                 
                <NavigationMenuItem className="list-none">
                     <NavigationMenuTrigger className={cn(navLinkStyles, "w-full")}>
                        <span>COMPOSICIÓN</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="flex flex-col p-2 w-56 bg-primary text-primary-foreground">
                            {compositionLinks.map((link) => (
                                <ListItem
                                    key={link.title}
                                    href={`/products?composition=${encodeURIComponent(link.composition)}`}
                                    title={link.title}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
             </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = ({ href, title, onNavigate }: { href: string; title: string, onNavigate?: () => void; }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
            'font-headline uppercase font-bold text-sm',
            'text-primary-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
          )}
        >
          <div className="font-medium">{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};