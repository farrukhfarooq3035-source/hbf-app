'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Smartphone, X } from 'lucide-react';

const DISMISS_KEY = 'hbf-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function InstallPrompt() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIos(isIOS());
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (isStandalone) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const fromInstall = searchParams.get('install') === '1';
    const onDownloadPage = pathname === '/download';
    if (fromInstall || onDownloadPage) {
      setShowBanner(true);
    }
  }, [deferredPrompt, isStandalone, pathname, searchParams]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[90] mx-auto max-w-md">
      <div className="rounded-2xl bg-primary text-white shadow-xl border-2 border-primary/80 p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Install HBF App</p>
          <p className="text-xs text-white/90">
            {ios ? 'Tap Share → Add to Home Screen' : 'Add to home screen for quick ordering'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!ios && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="px-4 py-2 rounded-xl bg-white text-primary font-bold text-sm tap-highlight"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-white/20 tap-highlight"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
