'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, ShoppingCart, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import { useCustomerStore } from '@/store/customer-store';
import { useCartStore } from '@/store/cart-store';
import { useThemeStore } from '@/store/theme-store';
import { useAuth } from '@/hooks/use-auth';
import { ProfilePanel } from '@/components/customer/ProfilePanel';

export function Header() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const { phone } = useCustomerStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { user, loading: authLoading, signOut } = useAuth();
  const isCustomerApp = !pathname.startsWith('/admin');

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-gray-200 dark:border-gray-700 shadow-soft">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/menu" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="HBF Haq Bahu Foods"
              className="h-11 w-auto object-contain"
            />
          </Link>
          {isCustomerApp && (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 tap-highlight"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              </button>
              {user ? (
                <>
                  <Link
                    href="/orders"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 tap-highlight"
                    title="My Orders"
                  >
                    <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </Link>
                  <Link
                    href="/cart"
                    className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 tap-highlight"
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold px-1">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 tap-highlight"
                    title={phone ? 'My Profile' : 'Profile'}
                  >
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login${pathname ? `?next=${encodeURIComponent(pathname)}` : ''}`}
                    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 tap-highlight flex items-center gap-1.5 px-3"
                    title="Sign in"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Sign in</span>
                  </Link>
                  <Link
                    href="/cart"
                    className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 tap-highlight"
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold px-1">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>
      {profileOpen && (
        <ProfilePanel onClose={() => setProfileOpen(false)} user={user} onSignOut={signOut} />
      )}
    </>
  );
}
