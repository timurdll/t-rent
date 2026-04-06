import React from 'react';
import { cn } from '@/src/shared/lib/utils';

interface FloatingElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: string;
  duration?: string;
}

export function FloatingElement({
  children,
  delay = '0s',
  duration = '6s',
  className,
  style,
  ...props
}: FloatingElementProps) {
  return (
    <div
      className={cn('animate-float', className)}
      style={{
        animationDelay: delay,
        animationDuration: duration,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
