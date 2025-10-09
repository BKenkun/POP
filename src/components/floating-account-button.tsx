
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { User, LayoutDashboard, Package, MapPin, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function FloatingAccountButton() {
  const router = useRouter();
  const { user, logout, isAdminAsCustomer } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
  }

  const handleAccountClick = () => {
    if (!user) {
        router.push('/login');
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => user && setIsOpen(true)}
      onMouseLeave={() => user && setIsOpen(false)}
    >
      <DropdownMenu open={user ? isOpen : false} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="relative h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Open user menu"
            onClick={handleAccountClick}
          >
            <User className="h-7 w-7" />
          </Button>
        </DropdownMenuTrigger>
        {user && (
            <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
            <DropdownMenuLabel>{isAdminAsCustomer ? 'Admin (Vista Cliente)' : 'Mi Cuenta'}</DropdownMenuLabel>
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
