
"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LayoutDashboard, Package, MapPin, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function FloatingAccountButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // No mostrar el botón en las rutas de administrador
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
  }

  const handleAccountClick = () => {
    if (!user) {
        router.push('/login');
    }
  }

  // Check if it's the simulated admin user
  const isSimulatedAdmin = user?.uid === 'admin_user';

  return (
    <div
      className="fixed bottom-24 right-6 z-50"
      onMouseEnter={() => user && setIsOpen(true)}
      onMouseLeave={() => user && setIsOpen(false)}
    >
      <DropdownMenu open={user ? isOpen : false} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="relative h-14 w-14 rounded-full shadow-lg"
            aria-label="Open user menu"
            onClick={handleAccountClick}
          >
            <User className="h-7 w-7" />
          </Button>
        </DropdownMenuTrigger>
        {user && (
            <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>{isSimulatedAdmin ? 'Admin (Vista Cliente)' : 'Mi Cuenta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                <Link href="/account">
                    <LayoutDashboard className="mr-2" />
                    <span>Panel de Usuario</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/account/orders">
                    <Package className="mr-2" />
                    <span>Pedidos</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/account/addresses">
                    <MapPin className="mr-2" />
                    <span>Direcciones</span>
                </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2" />
                <span>Cerrar Sesión</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
