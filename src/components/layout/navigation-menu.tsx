

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
import { SearchForm } from './search-form';
import { Separator } from '../ui/separator';
import type { SiteSettings } from '@/app/actions/site-settings';
import { useTranslation } from '@/context/language-context';

interface NavigationMenuComponentProps {
  onNavigate?: () => void;
  isMobile?: boolean;
  settings: SiteSettings | null;
}

export default function NavigationMenuComponent({ onNavigate, isMobile = false, settings }: NavigationMenuComponentProps) {
  const { t } = useTranslation();
  const subscriptionUrl = "/subscription";

  const productLinks = [
    { href: "/products", title: t('header.product_links.all') },
    { href: "/products?size=10ml", title: t('header.product_links.small') },
    { href: "/products?size=15ml", title: t('header.product_links.medium') },
    { href: "/products?size=25ml", title: t('header.product_links.large') },
    { href: "/products?internal_tag=pack", title: t('header.product_links.packs') },
    { href: "/products?internal_tag=accesorio", title: t('header.product_links.accessories') },
    { href: "/products?internal_tag=juguete", title: t('header.product_links.toys') },
  ];

  const compositionLinks = [
    { title: t('header.composition_links.amyl'), composition: 'Amilo' },
    { title: t('header.composition_links.pentyl'), composition: 'Pentilo' },
    { title: t('header.composition_links.propyl'), composition: 'Propilo' },
    { title: t('header.composition_links.cbd'), composition: 'CBD' },
    { title: t('header.composition_links.mix'), composition: 'Mix' },
  ];

  if (isMobile) {
      return (
          <div className="flex flex-col gap-2 w-full">
              {productLinks.map(link => (
                  <Button key={link.href} variant="ghost" asChild className="w-full justify-start font-body font-medium uppercase text-sm text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                      <Link href={link.href} onClick={onNavigate}>{link.title}</Link>
                  </Button>
              ))}
               <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between font-body font-medium uppercase text-sm text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                            <span>{t('header.composition_links.title')}</span>
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
              
              <Separator className="my-2 bg-primary-foreground/20" />

               <Button variant="ghost" asChild className="w-full justify-start font-headline uppercase font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  <Link href="/create-pack" onClick={onNavigate}>{t('header.create_pack')}</Link>
              </Button>
              {settings?.showSubscriptionFeature && (
                <Button variant="secondary" asChild className="w-full justify-start font-headline uppercase font-bold bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={subscriptionUrl} onClick={onNavigate}>{t('header.monthly_dose')}</Link>
                </Button>
              )}

              <div className="mt-2">
                 <SearchForm onSearch={onNavigate} />
              </div>
          </div>
      );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
           <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "font-headline uppercase font-bold bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground")}>
                 <Link href="/products">
                    <span>{t('header.products')}</span>
                 </Link>
           </NavigationMenuTrigger>
          <NavigationMenuContent>
             <ul className="flex flex-col p-2 w-64 bg-primary text-primary-foreground border-r border-primary-foreground/20">
                 {productLinks.slice(1).map(link => ( // Slice to exclude "TODOS LOS PRODUCTOS"
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
                            <span>{t('header.composition_links.title')}</span>
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
                    {t('header.create_pack')}
                </Link>
            </NavigationMenuLink>
        </NavigationMenuItem>
        {settings?.showSubscriptionFeature && (
            <NavigationMenuItem>
                <Button asChild variant="secondary" className="h-10 font-headline uppercase font-bold text-sm px-3 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href={subscriptionUrl}> 
                        {t('header.monthly_dose')}
                    </Link>
                </Button>
            </NavigationMenuItem>
        )}
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
