'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
    // Allow skipping after showing toast
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
    onClose();
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="card-retro max-w-xl w-full">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{slides[index].title}</h2>
          <p className="opacity-80 mt-2">{slides[index].body}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button className="btn-secondary" onClick={handleSkip}>
            Skip
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-md-primary' : 'bg-md-outline-variant'}`}
              />
            ))}
          </div>

          <button className="btn-primary" onClick={handleNext}>
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
