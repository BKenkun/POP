
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, MapPin, LogOut, HeartPulse, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout, isSubscribed, isAdmin } = useAuth();

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      logout();
  }

  const navLinks = [
    ...(isAdmin ? [{ href: '/admin', label: 'Panel de Admin', icon: Shield }] : []),
    { href: '/account', label: 'Panel de Usuario', icon: LayoutDashboard },
    { href: '/account/orders', label: 'Pedidos', icon: Package },
    { href: '/account/addresses', label: 'Direcciones', icon: MapPin },
    ...(isSubscribed ? [{ href: '/account/subscription', label: 'Dosis Mensual', icon: HeartPulse }] : []),
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
                Cerrar Sesión
            </Button>
        </nav>
    </Card>
  );
}
