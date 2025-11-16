'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-md-surface-container-highest text-md-on-surface px-6 py-3 rounded shadow-lg border border-md-outline-variant">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
