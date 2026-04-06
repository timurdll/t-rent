import React from 'react';
import { cn } from '@/src/shared/lib/utils';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  children: React.ReactNode;
}

export function Typography({
  variant = 'p',
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = variant;

  return (
    <Component
      className={cn(
        {
          'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6': variant === 'h1',
          'text-3xl md:text-4xl font-bold tracking-tight mb-8': variant === 'h2',
          'text-xl md:text-2xl font-semibold mb-4': variant === 'h3',
          'text-base md:text-lg leading-relaxed text-gray-500': variant === 'p',
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
