'use client';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 28, className = '' }: SpinnerProps) {
  return (
    <span
      className={`spinner ${className}`.trim()}
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 12) }}
      aria-hidden="true"
    />
  );
}
