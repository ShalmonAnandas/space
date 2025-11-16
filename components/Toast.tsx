'use client';

import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="surface-soft surface-glow border border-surface-border px-5 py-3 rounded-2xl shadow-elevated flex items-center gap-3 text-sm">
        <Sparkles size={16} className="text-accent-strong" />
        <p className="font-medium text-neutral-100">{message}</p>
      </div>
    </div>
  );
}
