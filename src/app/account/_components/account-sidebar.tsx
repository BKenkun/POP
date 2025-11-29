
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, MapPin, LogOut, HeartPulse, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/app/actions/site-settings';
import type { SiteSettings } from '@/app/actions/site-settings';
import { useTranslation } from '@/context/language-context';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout, isSubscribed, isAdmin } = useAuth();
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

  const navLinks = [
    ...(isAdmin ? [{ href: '/admin', label: t('account.sidebar_admin_panel'), icon: Shield }] : []),
    { href: '/account', label: t('account.sidebar_dashboard'), icon: LayoutDashboard },
    { href: '/account/orders', label: t('account.sidebar_orders'), icon: Package },
    { href: '/account/addresses', label: t('account.sidebar_addresses'), icon: MapPin },
    ...(isSubscribed && settings?.showSubscriptionFeature ? [{ href: '/account/subscription', label: t('account.sidebar_subscription'), icon: HeartPulse }] : []),
  ];

  return (
    <Card>
        <nav className="flex flex-col gap-1 p-2">
            {navLinks.map((link) => {
                const isActive = link.href === '/account' 
                    ? pathname === link.href 
                    : pathname.startsWith(link.href);
                
                const isExternalAdminLink = link.href === '/admin';

                return (
                <Link key={link.href} href={link.href} passHref target={isExternalAdminLink ? '_blank' : undefined}>
                    <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                        "w-full justify-start",
                        isExternalAdminLink && "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900"
                    )}
                    >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
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
