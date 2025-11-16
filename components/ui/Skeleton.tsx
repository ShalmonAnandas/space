'use client';

import { CSSProperties } from 'react';

interface SkeletonProps {
  height?: number;
  width?: number | string;
  className?: string;
  radius?: number;
}

export function Skeleton({
  height = 16,
  width = '100%',
  className = '',
  radius,
}: SkeletonProps) {
  const style: CSSProperties = {
    height,
    width,
  };

  if (typeof radius === 'number') {
    style.borderRadius = radius;
  }

  return <div className={`skeleton ${className}`.trim()} style={style} aria-hidden="true" />;
}
