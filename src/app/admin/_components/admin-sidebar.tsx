
'use client';

import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart, Users, Briefcase, Ticket, Warehouse, Globe, Settings, Truck, Calculator } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/orders', label: 'Pedidos', icon: Package },
    { href: '/admin/products', label: 'Catálogo', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Clientes', icon: Users },
    { href: '/admin/stock', label: 'Almacén', icon: Warehouse },
    { href: '/admin/shipping', label: 'Envíos', icon: Truck },
    { href: '/admin/accounting', label: 'Contabilidad', icon: Calculator },
    { href: '/admin/b2b', label: 'B2B', icon: Briefcase },
    { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
    { href: '/admin/web', label: 'Web', icon: Globe },
    { href: '/admin/blog', label: 'Blog', icon: Newspaper },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout();
  }

  return (
    <>
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
           <Logo className="h-8 w-auto" />
           <span className="">PuroRush</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                pathname === link.href ? 'bg-muted text-primary' : ''
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/" target="_blank">
                <Store className="mr-2" />
                Ver tienda
            </Link>
         </Button>
         <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Cerrar Sesión
         </Button>
      </div>
    </>
  );
}
