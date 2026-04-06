import React from 'react';
import { cn } from '@/src/shared/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  bg?: 'white' | 'gray' | 'dark' | 'primary';
  containerClassName?: string;
  id?: string;
}

export function Section({
  children,
  className,
  containerClassName,
  bg = 'white',
  id,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'w-full py-16 md:py-24',
        {
          'bg-white text-foreground': bg === 'white',
          'bg-gray-bg text-foreground': bg === 'gray',
          'bg-dark text-white': bg === 'dark',
          'bg-primary text-dark': bg === 'primary',
        },
        className
      )}
      {...props}
    >
      <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl', containerClassName)}>
        {children}
      </div>
    </section>
  );
}
