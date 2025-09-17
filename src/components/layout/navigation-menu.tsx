
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
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';

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
  const { user, isSubscribed } = useAuth();
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const subscriptionUrl = isSubscribed ? "/account/subscription" : "/subscription";

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
           <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground")}>
                 <Link href="/products">
                    <span>Productos</span>
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
                 
                <Collapsible>
                  <li>
                    <CollapsibleTrigger
                        className={cn(
                          'w-full block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors group',
                          'text-primary-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                          "flex items-center justify-between cursor-pointer font-headline uppercase font-bold text-sm"
                        )}
                      >
                       <div className="flex items-center justify-between w-full">
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
                                  isSubItem
                              />
                          ))}
                      </ul>
                    </CollapsibleContent>
                  </li>
                </Collapsible>
             </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
            <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground")}>
                <Link href="/create-pack">
                    CREA TU PACK
                </Link>
            </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
            <Button asChild variant="destructive" size="sm" className="font-headline uppercase font-bold text-sm h-8">
                <Link href={subscriptionUrl}> 
                    Dosis Mensual
                </Link>
            </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = ({ href, title, onNavigate, isSubItem = false }: { href: string; title: string, onNavigate?: () => void; isSubItem?: boolean }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
            'text-primary-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            'font-body font-medium uppercase text-sm'
          )}
        >
          <div>{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
