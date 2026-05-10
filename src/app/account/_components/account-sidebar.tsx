'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { Button, Card } from '@/components';
import { LogOut } from 'lucide-react';
import { useAuth, useTranslation } from '@/context';
import { useEffect, useMemo, useState } from 'react';
import { getSiteSettings } from '@/app/actions/site-settings';
import type { SiteSettings } from '@/app/actions/site-settings';
import { ACCOUNT_NAV_LINKS } from '@/config/account-nav-links';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout, isAdmin, isSubscribed } = useAuth();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const siteSettings = await getSiteSettings();
      setSettings(siteSettings);
    }
    fetchSettings();
  }, []);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      logout();
  }

  const navLinks = useMemo(() => {
    return ACCOUNT_NAV_LINKS
      .filter((link) => {
        if (link.adminOnly && !isAdmin) return false;
        if (link.subscriptionFeature && !settings?.showSubscriptionFeature) return false;
        return true;
      }).map((link) => ({
        ...link,
        href: link.dynamicSubscriptionHref
          ? isSubscribed
            ? '/account/subscription'
            : '/subscription'
          : link.href,
      }));
  }, [isAdmin, isSubscribed, settings]);

  return (
    <Card>
        <nav className="flex flex-col gap-1 p-2">
            {navLinks.map((link) => {
                const isActive =
            link.href === '/account'
              ? pathname === link.href
              : pathname.startsWith(link.href);
                return (
                <Link key={link.href} href={link.href} passHref target={link.external ? '_blank' : undefined}>
                    <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                        "w-full justify-start",
                        link.external && "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900"
                    )}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {t(link.label)}
                    </Button>
                </Link>
                );
            })}
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('account.sidebar_logout')}
            </Button>
        </nav>
    </Card>
  );
}