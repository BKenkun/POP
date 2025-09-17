
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, MapPin, LogOut, HeartPulse } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout, isSubscribed } = useAuth();

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      logout();
  }

  const navLinks = [
    { href: '/account', label: 'Panel de Usuario', icon: LayoutDashboard },
    { href: '/account/orders', label: 'Pedidos', icon: Package },
    ...(isSubscribed ? [{ href: '/account/subscription', label: 'Mi Suscripción', icon: HeartPulse }] : []),
    { href: '/account/addresses', label: 'Direcciones', icon: MapPin },
  ];

  return (
    <Card>
        <nav className="flex flex-col gap-1 p-2">
            {navLinks.map((link) => {
                const isActive = link.href === '/account' 
                    ? pathname === link.href 
                    : pathname.startsWith(link.href);
                return (
                <Link key={link.href} href={link.href} passHref>
                    <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start"
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
