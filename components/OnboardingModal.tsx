'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onComplete: () => void;
  onShowToast: (msg: string) => void;
}

export default function OnboardingModal({ onClose, onComplete, onShowToast }: OnboardingModalProps) {
  const slides = useMemo(
    () => [
      {
        title: 'Welcome to Space',
        body: 'Create a space and invite anybody. It\'s your private corner.'
      },
      {
        title: 'Inside a Space',
        body: 'Share gossip, react to posts, set your mood, leave notices, inform about sutta breaks, and vent frustrations.'
      },
      {
        title: 'Notifications',
        body: 'Enable notifications. Just do it. You don\'t get an option'
      }
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [minReadUntil, setMinReadUntil] = useState<number>(0);
  const lastChangeAtRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    lastChangeAtRef.current = now;
    setMinReadUntil(now + 1500); // require ~1.5s per slide before allowing Next
  }, [index]);

  const handleSkip = () => {
    onShowToast('Just read the frickin instructions');
    // Do not close or mark complete; keep modal open
  };

  const handleNext = () => {
    const now = Date.now();
    if (now < minReadUntil) {
      onShowToast('Just read the frickin instructions');
      return;
    }

    if (index < slides.length - 1) {
      setIndex((i) => i + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      onComplete();
      onClose();
    }
  };

  const isLast = index === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-[rgba(5,7,12,0.78)]">
      <div className="surface-panel max-w-xl w-full space-y-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
            <Sparkles size={24} className="text-accent-strong" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight">{slides[index].title}</h2>
            <p className="text-neutral-300 leading-relaxed">{slides[index].body}</p>
          </div>
          <button className="btn-ghost" aria-label="Skip onboarding" onClick={handleSkip}>
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-8 rounded-full transition-colors ${
                  i === index ? 'bg-accent-soft' : 'bg-[rgba(255,255,255,0.08)]'
                }`}
              />
            ))}
          </div>

          <button className="btn-primary" onClick={handleNext}>
            {isLast ? (
              <>
                <Sparkles size={18} />
                <span>Let&apos;s go</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
