'use client';

import { WalkInPOS } from '@/components/admin/walkin/WalkInPOS';

export default function WalkInPOSPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Walk-in / Dine-in POS</h1>
        <p className="text-sm text-gray-700">
          Quickly create counter or dine-in orders, print receipts, and record payments from one place.
        </p>
      </div>
      <WalkInPOS />
    </div>
  );
}
