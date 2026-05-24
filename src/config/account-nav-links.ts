import { HeartPulse, LayoutDashboard, MapPin, Package, Shield, type LucideIcon } from 'lucide-react';

export type AccountNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  subscriptionFeature?: boolean;
  dynamicSubscriptionHref?: boolean;
  external?: boolean;
};

export const ACCOUNT_NAV_LINKS: AccountNavLink[] = [
  {
    href: '/admin',
    label: 'account.sidebar_admin_panel',
    icon: Shield,
    adminOnly: true,
    external: true,
  },
  {
    href: '/account',
    label: 'account.sidebar_dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/account/orders',
    label: 'account.sidebar_orders',
    icon: Package,
  },
  {
    href: '/account/addresses',
    label: 'account.sidebar_addresses',
    icon: MapPin,
  },
  {
    href: '/subscription',
    label: 'account.sidebar_subscription',
    icon: HeartPulse,
    subscriptionFeature: true,
    dynamicSubscriptionHref: true,
  },
];