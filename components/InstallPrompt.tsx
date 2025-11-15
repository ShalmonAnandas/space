'use client';

import { usePWA } from '@/lib/usePWA';

export function InstallPrompt() {
  const { canInstall, isIOSDevice, installApp } = usePWA();

  if (!canInstall && !isIOSDevice) return null;

  if (isIOSDevice) {
    return (
      <div id="install-prompt" className="fixed bottom-4 left-4 right-4 bg-pastel-purple p-4 rounded-lg shadow-lg z-50">
        <h3 className="font-bold text-gray-800 mb-2">Install Partner App</h3>
        <p className="text-sm text-gray-700 mb-3">
          Tap the Share button <span className="inline-block">📤</span> and select &quot;Add to Home Screen&quot;
        </p>
        <button
          onClick={() => {
            const element = document.getElementById('install-prompt');
            if (element) element.style.display = 'none';
          }}
          className="text-sm text-gray-600 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div id="install-prompt" className="fixed bottom-4 left-4 right-4 bg-pastel-purple p-4 rounded-lg shadow-lg z-50">
      <h3 className="font-bold text-gray-800 mb-2">Install Partner App</h3>
      <p className="text-sm text-gray-700 mb-3">
        Install for the best experience
      </p>
      <div className="flex gap-2">
        <button
          onClick={installApp}
          className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          Install
        </button>
        <button
          onClick={() => {
            const element = document.getElementById('install-prompt');
            if (element) element.style.display = 'none';
          }}
          className="text-sm text-gray-600 underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
