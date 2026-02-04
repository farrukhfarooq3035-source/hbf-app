'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Download, Printer } from 'lucide-react';
import { PRODUCTION_APP_URL } from '@/lib/store-config';

export default function AdminDownloadPage() {
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use production URL for QR so it always points to stable kappa (not 404 e4480561)
      const base = PRODUCTION_APP_URL.replace(/\/$/, '');
      setAppUrl(`${base}/download?install=1`);
    }
  }, []);

  const baseUrl = appUrl ? appUrl.replace('/download?install=1', '') : '';
  const qrUrl = appUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(appUrl)}`
    : '';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!appUrl) return;
    const downloadUrl = `/api/qr?url=${encodeURIComponent(appUrl)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'hbf-app-qr.png';
    a.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Smartphone className="w-7 h-7 text-primary" />
        Download App – QR Code
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Download ya print karke customers ko dein. Scan karke app open ho jayegi.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center print-qr-card">
          {qrUrl ? (
            <div id="qr-print-area" className="p-4 bg-white rounded-2xl border-2 border-gray-200 dark:border-gray-600 mb-4">
              <img
                src={qrUrl}
                alt="HBF App QR Code"
                width={280}
                height={280}
                className="w-[280px] h-[280px]"
              />
            </div>
          ) : (
            <div className="w-[280px] h-[280px] bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse mb-4" />
          )}
          <p className="text-center font-semibold text-gray-800 dark:text-gray-200 mb-1">Scan → Install popup will appear</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-6">{appUrl}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 print:hidden"
            >
              <Download className="w-5 h-5" />
              Download QR
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 print:hidden"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 print:hidden">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Direct link</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Customers ko ye link share karein:</p>
            <code className="block p-3 bg-white dark:bg-gray-800 rounded-lg text-sm break-all border border-gray-200 dark:border-gray-600">
              {baseUrl || appUrl || 'Loading...'}
            </code>
            <a
              href={baseUrl || appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-primary font-medium hover:underline"
            >
              Open in new tab →
            </a>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Tip:</strong> QR print karke counter pe laga dein. Scan karke Install popup aayega — Android pe Install tap karein, iPhone pe Share → Add to Home Screen.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
