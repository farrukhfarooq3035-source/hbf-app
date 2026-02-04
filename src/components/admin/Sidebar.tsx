'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Upload,
  Bike,
  Boxes,
  Receipt,
  BarChart3,
  Settings,
  Users,
  Tag,
  MapPin,
  CalendarDays,
  Sparkles,
  Star,
  Smartphone,
  PenSquare,
  FileSpreadsheet,
  UtensilsCrossed,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { clsx } from 'clsx';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders/online', icon: ShoppingBag, label: 'Online Orders' },
  { href: '/admin/orders/restaurant', icon: UtensilsCrossed, label: 'Restaurant Orders' },
  { href: '/admin/walkin', icon: PenSquare, label: 'Walk-in POS' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/import', icon: Upload, label: 'Import Menu' },
  { href: '/admin/riders', icon: Bike, label: 'Riders' },
  { href: '/admin/inventory', icon: Boxes, label: 'Inventory' },
  { href: '/admin/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/admin/promo', icon: Tag, label: 'Promo Codes' },
  { href: '/admin/happy-hour', icon: Sparkles, label: 'Happy Hour' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/zones', icon: MapPin, label: 'Delivery Zones' },
  { href: '/admin/reservations', icon: CalendarDays, label: 'Reservations' },
  { href: '/admin/sales', icon: FileSpreadsheet, label: 'Sales Record' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { href: '/admin/download', icon: Smartphone, label: 'Download App' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('hbf-admin-verified');
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <aside className="no-print w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <Link href="/admin" className="p-4 flex items-center gap-2 border-b border-white/10">
        <img
          src="/logo.png"
          alt=""
          className="h-10 w-auto object-contain max-w-[120px]"
        />
        <span className="font-bold text-lg text-white">HBF Admin</span>
      </Link>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                isActive ? 'bg-primary text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <Link
          href="/"
          className="block text-sm text-slate-300 hover:text-white"
        >
          ← Back to Store
        </Link>
      </div>
    </aside>
  );
}
