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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const compositionLinks = [
  { title: 'POPPERS DE AMILO', composition: 'Amilo' },
  { title: 'POPPERS DE PENTILO', composition: 'Pentilo' },
  { title: 'POPPERS DE PROPILO', composition: 'Propilo' },
  { title: 'POPPERS AL CBD', composition: 'CBD' },
  { title: 'MIX DE NITRITOS', composition: 'Mix' },
];

interface NavigationMenuComponentProps {
  onNavigate?: () => void;
}

export default function NavigationMenuComponent({ onNavigate }: NavigationMenuComponentProps) {
  const navLinkStyles = cn(
    'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
    'font-headline uppercase font-bold text-sm',
    'text-primary-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/products" passHref legacyBehavior>
            <NavigationMenuTrigger 
              className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground")}
            >
              Productos
            </NavigationMenuTrigger>
          </Link>
          <NavigationMenuContent>
             <ul className="flex flex-col p-2 w-64 bg-primary text-primary-foreground border-r border-primary-foreground/20">
                 <ListItem href="/products?size=10ml" title="POPPERS PEQUEÑOS (10ML)" onNavigate={onNavigate} />
                 <ListItem href="/products?size=15ml" title="POPPERS MEDIANOS (15ML)" onNavigate={onNavigate} />
                 <ListItem href="/products?size=25ml" title="POPPERS GRANDES (25ML)" onNavigate={onNavigate} />
                 <ListItem href="/products?internal_tag=pack" title="PACKS DE POPPERS" onNavigate={onNavigate} />
                 <ListItem href="/products?internal_tag=accesorio" title="ACCESORIOS PARA POPPERS" onNavigate={onNavigate} />
                 <ListItem href="/products?internal_tag=juguete" title="JUGUETES ERÓTICOS" onNavigate={onNavigate} />
                 
                <Collapsible asChild>
                  <li>
                    <CollapsibleTrigger asChild>
                      <div className={cn(navLinkStyles, "flex items-center justify-between cursor-pointer")}>
                        <span>COMPOSICIÓN</span>
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                       <ul className="flex flex-col pt-2 pl-4">
                          {compositionLinks.map((link) => (
                              <ListItem
                                  key={link.title}
                                  href={`/products?composition=${encodeURIComponent(link.composition)}`}
                                  title={link.title}
                                  onNavigate={onNavigate}
                              />
                          ))}
                      </ul>
                    </CollapsibleContent>
                  </li>
                </Collapsible>
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
