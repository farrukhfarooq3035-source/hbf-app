'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Deals page removed - redirect to admin */
export default function AdminDealsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin');
  }, [router]);
  return (
    <div className="p-6">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
