'use client';

import { usePWA } from '@/lib/usePWA';

export function InstallPrompt() {
  const { canInstall, isIOSDevice, installApp } = usePWA();

  if (!canInstall && !isIOSDevice) return null;

  if (isIOSDevice) {
    return (
      <div id="install-prompt" className="fixed bottom-4 left-4 right-4 bg-md-primary-container text-md-on-primary-container p-4 rounded shadow-lg z-50">
        <h3 className="font-semibold mb-2">Install Space</h3>
        <p className="text-sm opacity-90 mb-3">
          Tap the Share button and select &quot;Add to Home Screen&quot;
        </p>
        <button
          onClick={() => {
            const element = document.getElementById('install-prompt');
            if (element) element.style.display = 'none';
          }}
          className="text-sm opacity-80 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div id="install-prompt" className="fixed bottom-4 left-4 right-4 bg-md-primary-container text-md-on-primary-container p-4 rounded shadow-lg z-50">
      <h3 className="font-semibold mb-2">Install Space</h3>
      <p className="text-sm opacity-90 mb-3">
        Install for the best experience
      </p>
      <div className="flex gap-2">
        <button
          onClick={installApp}
          className="bg-md-surface text-md-on-surface px-4 py-2 rounded font-medium hover:bg-md-surface-container-high"
        >
          Install
        </button>
        <button
          onClick={() => {
            const element = document.getElementById('install-prompt');
            if (element) element.style.display = 'none';
          }}
          className="text-sm opacity-80 underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
