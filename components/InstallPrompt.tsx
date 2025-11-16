'use client';

import { usePWA } from '@/lib/usePWA';
import { Download, Share } from 'lucide-react';

export function InstallPrompt() {
  const { canInstall, isIOSDevice, installApp } = usePWA();

  if (!canInstall && !isIOSDevice) return null;

  const hidePrompt = () => {
    const element = document.getElementById('install-prompt');
    if (element) element.style.display = 'none';
  };

  if (isIOSDevice) {
    return (
      <div
        id="install-prompt"
        className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in"
      >
        <div className="surface-panel compact surface-glow flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
            <Share size={18} className="text-accent-strong" />
          </div>
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Install Space</h3>
              <button onClick={hidePrompt} className="text-xs text-neutral-500 hover:text-neutral-300">
                Dismiss
              </button>
            </div>
            <p className="text-neutral-400">
              Tap the Share button and choose <span className="text-neutral-200 font-medium">Add to Home Screen</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="install-prompt"
      className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in"
    >
      <div className="surface-panel compact surface-glow flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
          <Download size={18} className="text-accent-strong" />
        </div>
        <div className="flex-1 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Install Space</h3>
            <button onClick={hidePrompt} className="text-xs text-neutral-500 hover:text-neutral-300">
              Dismiss
            </button>
          </div>
          <p className="text-neutral-400">Install Space for faster access and smooth notifications.</p>
          <div className="flex gap-2">
            <button
              onClick={installApp}
              className="btn-primary"
            >
              <Download size={16} />
              <span>Install</span>
            </button>
            <button onClick={hidePrompt} className="btn-tertiary">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
