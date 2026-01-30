'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

export function CartBar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const bump = useCartStore((s) => s.bump);
  const setBump = useCartStore((s) => s.setBump);

  useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [bump, setBump]);

  if (itemCount === 0) return null;
  if (pathname.startsWith('/admin')) return null;
  if (pathname === '/cart' || pathname === '/checkout') return null;

  return (
    <Link
      href="/cart"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-primary text-white p-4 flex items-center justify-between safe-area-bottom shadow-soft-lg tap-highlight transition-transform duration-280 ease-out-expo ${bump ? 'animate-cart-bump' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-accent text-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        </div>
        <span className="font-semibold">View Cart</span>
      </div>
      <span className="font-bold text-lg">Rs {total}/-</span>
    </Link>
  );
}
