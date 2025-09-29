
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

const productLinks = [
    { href: "/products?size=10ml", title: "POPPERS PEQUEÑOS (10ML)" },
    { href: "/products?size=15ml", title: "POPPERS MEDIANOS (15ML)" },
    { href: "/products?size=25ml", title: "POPPERS GRANDES (25ML)" },
    { href: "/products?internal_tag=pack", title: "PACKS DE POPPERS" },
    { href: "/products?internal_tag=accesorio", title: "ACCESORIOS PARA POPPERS" },
    { href: "/products?internal_tag=juguete", title: "JUGUETES ERÓTICOS" },
];

interface NavigationMenuComponentProps {
  onNavigate?: () => void;
  isMobile?: boolean;
}

export default function NavigationMenuComponent({ onNavigate, isMobile = false }: NavigationMenuComponentProps) {
  const { user, isSubscribed } = useAuth();
  
  const subscriptionUrl = isSubscribed ? "/account/subscription" : "/subscription";

  if (isMobile) {
      return (
          <div className="flex flex-col gap-1 w-full">
              <Collapsible>
                  <CollapsibleTrigger asChild>
                     <Button variant="ghost" className="w-full justify-between font-headline uppercase font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                        <span>Productos</span>
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                      <div className="flex flex-col gap-1 pl-4 mt-1">
                          {productLinks.map(link => (
                              <Button key={link.href} variant="ghost" asChild className="w-full justify-start font-body font-medium uppercase text-sm text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                                  <Link href={link.href} onClick={onNavigate}>{link.title}</Link>
                              </Button>
                          ))}
                           <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-between font-body font-medium uppercase text-sm text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                                        <span>Composición</span>
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="flex flex-col gap-1 pl-4 mt-1">
                                        {compositionLinks.map(link => (
                                             <Button key={link.composition} variant="ghost" asChild className="w-full justify-start font-body font-light uppercase text-xs text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                                                <Link href={`/products?composition=${encodeURIComponent(link.composition)}`} onClick={onNavigate}>{link.title}</Link>
                                            </Button>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                           </Collapsible>
                      </div>
                  </CollapsibleContent>
              </Collapsible>
              
               <Button variant="ghost" asChild className="w-full justify-start font-headline uppercase font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  <Link href="/create-pack" onClick={onNavigate}>Crea tu Pack</Link>
              </Button>
              <Button variant="destructive" asChild className="w-full justify-start font-headline uppercase font-bold">
                  <Link href={subscriptionUrl} onClick={onNavigate}>Dosis Mensual</Link>
              </Button>
          </div>
      );
  }

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
                 {productLinks.map(link => (
                    <ListItem key={link.href} href={link.href} title={link.title} onNavigate={onNavigate} />
                 ))}
                 
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
            <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "h-10 font-headline uppercase font-bold bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground")}>
                <Link href="/create-pack">
                    CREA TU PACK
                </Link>
            </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
            <Button asChild variant="destructive" className="h-10 font-headline uppercase font-bold text-sm px-3">
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
