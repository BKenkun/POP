

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
import { User, LayoutDashboard, Package, MapPin, LogOut, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';
import { formatRemainingClock } from '@/lib/session-timeout';

export default function FloatingAccountButton() {
  const router = useRouter();
  const { user, logout, isAdmin, sessionRemainingMs, extendSession } = useAuth();
  const { t } = useTranslation();
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
            <DropdownMenuLabel className="flex items-center justify-between gap-2">
              <span>{t(isAdmin ? 'account.menu.admin_title' : 'account.menu.user_title')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-normal text-muted-foreground tabular-nums">
                <Clock className="h-3 w-3" />
                {formatRemainingClock(sessionRemainingMs)}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                        <Shield className="mr-2" />
                        <span>{t('account.menu.admin_panel')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                <Link href="/account">
                    <LayoutDashboard className="mr-2" />
                    <span>{t('account.menu.user_dashboard')}</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/account/orders">
                    <Package className="mr-2" />
                    <span>{t('account.menu.orders')}</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/account/addresses">
                    <MapPin className="mr-2" />
                    <span>{t('account.menu.addresses')}</span>
                </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void extendSession()}>
                <Clock className="mr-2" />
                <span>Renew session</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2" />
                <span>{t('account.menu.logout')}</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
