
"use client";

import { usePathname } from 'next/navigation';
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

export default function FloatingAccountButton() {
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="relative h-14 w-14 rounded-full shadow-lg"
            aria-label="Open user menu"
          >
            <User className="h-7 w-7" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
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
          <DropdownMenuItem>
            <LogOut className="mr-2" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
