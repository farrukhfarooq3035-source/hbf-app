import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-800 text-center mb-6">
        This admin page may have been removed or the link is incorrect.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors"
      >
        <LayoutDashboard className="w-5 h-5" />
        Back to Dashboard
      </Link>
    </div>
  );
}
