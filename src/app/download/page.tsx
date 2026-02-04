'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone, ExternalLink, QrCode } from 'lucide-react';

export default function DownloadPage() {
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin;
      setAppUrl(`${base}/download?install=1`);
    }
  }, []);

  const baseUrl = appUrl ? new URL(appUrl).origin : '';
  const qrUrl = appUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(appUrl)}`
    : '';

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-4">
          <Smartphone className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Download HBF App</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Order food from Haq Bahu Foods on your phone
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-dark dark:text-white">Scan to open</h2>
        </div>
        {qrUrl ? (
          <div className="p-4 bg-white rounded-2xl border-2 border-gray-200 dark:border-gray-600 mb-6">
            <img
              src={qrUrl}
              alt="QR Code - Scan to open HBF App"
              width={280}
              height={280}
              className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]"
            />
          </div>
        ) : (
          <div className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse mb-6" />
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          Scan QR code — Install popup will appear for Add to Home Screen
        </p>

        <a
          href={baseUrl ? `${baseUrl}/menu` : '#'}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors tap-highlight"
        >
          <ExternalLink className="w-5 h-5" />
          Open App Now
        </a>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Or tap &quot;Add to Home Screen&quot; in your browser for app-like experience
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/menu" className="text-primary font-medium hover:underline">
          ← Back to Menu
        </Link>
      </div>
    </div>
  );
}
