'use client';

import { Button } from '@/components/ui/button';
import { Home, Newspaper, LogOut, Store, Package, ShoppingCart, Users, Briefcase, Ticket, Warehouse, Globe, Settings, Truck, Calculator, Landmark, ChevronDown, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  
  const isLogisticsActive = pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/stock') || pathname.startsWith('/admin/shipping');
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(isLogisticsActive);
  
  const isCollapsed = state === 'collapsed';

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { 
        isCollapsible: true,
        label: 'Logistics',
        icon: Landmark,
        isOpen: isLogisticsOpen,
        onOpenChange: setIsLogisticsOpen,
        isActive: isLogisticsActive,
        subLinks: [
            { href: '/admin/orders', label: 'Orders', icon: Package },
            { href: '/admin/stock', label: 'Warehouse', icon: Warehouse },
            { href: '/admin/shipping', label: 'Shipments', icon: Truck },
        ]
    },
    { href: '/admin/products', label: 'Catalog', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/accounting', label: 'Accounting', icon: Calculator },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/web', label: 'Web Settings', icon: Globe },
    { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  ];

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout();
  }

  return (
    <div className="flex flex-col h-full">
       <div className={cn("flex h-[60px] items-center border-b", isCollapsed ? "justify-center" : "px-4")}>
        {!isCollapsed && (
             <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <Logo className="h-8 w-auto" />
             </Link>
        )}
         <Button variant="ghost" size="icon" className={cn("hidden lg:flex", !isCollapsed && "ml-auto")} onClick={toggleSidebar}>
            <PanelLeft className={cn("h-5 w-5 transition-transform", isCollapsed && 'rotate-180')} />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map((link) => (
            link.isCollapsible ? (
                <Collapsible key={link.label} open={link.isOpen && !isCollapsed} onOpenChange={link.onOpenChange}>
                    <CollapsibleTrigger asChild>
                         <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer', link.isActive && 'bg-muted text-primary')}>
                            <link.icon className="h-4 w-4" />
                            {!isCollapsed && <>{link.label}<ChevronDown className="ml-auto h-4 w-4" /></>}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-7 pt-1">
                        {link.subLinks.map((sub) => (
                            <Link key={sub.href} href={sub.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname === sub.href && "bg-muted text-primary")}>
                                <sub.icon className="h-4 w-4" />
                                {sub.label}
                            </Link>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary', pathname === link.href && 'bg-muted text-primary')}>
                    <link.icon className="h-4 w-4" />
                    {!isCollapsed && link.label}
                </Link>
            )
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <Button variant="ghost" className="w-full justify-start" asChild><Link href="/"><Store className="mr-2" />{!isCollapsed && "View Store"}</Link></Button>
         <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}><LogOut className="mr-2" />{!isCollapsed && "Logout"}</Button>
      </div>
    </div>
  );
}
