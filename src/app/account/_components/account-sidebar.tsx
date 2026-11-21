
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, MapPin, LogOut, HeartPulse, Shield, Clock, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { getSiteSettings } from '@/app/actions/site-settings';
import type { SiteSettings } from '@/app/actions/site-settings';
import { useTranslation } from '@/context/language-context';
import { formatRemainingClock, IDLE_WARNING_WINDOW_MS } from '@/lib/session-timeout';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout, isSubscribed, isAdmin, sessionRemainingMs, extendSession } = useAuth();
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
    ...(settings?.showSubscriptionFeature ? [{ 
        href: isSubscribed ? '/account/subscription' : '/subscription', 
        label: t('account.sidebar_subscription'), 
        icon: HeartPulse 
    }] : []),
  ];

  const isWarning = sessionRemainingMs <= IDLE_WARNING_WINDOW_MS;

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
            <div className="my-1 border-t pt-2">
              <button
                type="button"
                onClick={() => void extendSession()}
                title="Click to reset the inactivity timer"
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-mono tabular-nums transition-colors",
                  isWarning
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Session: {formatRemainingClock(sessionRemainingMs)}
                </span>
                <RefreshCw className="h-3 w-3 opacity-70" />
              </button>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('account.sidebar_logout')}
            </Button>
        </nav>
    </Card>
  );
}
