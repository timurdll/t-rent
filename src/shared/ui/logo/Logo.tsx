import React from 'react';
import { cn } from '@/src/shared/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 select-none', className)}>
      <div className="flex bg-primary w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-sm">
        <span className="text-dark font-extrabold text-xl md:text-2xl leading-none">T</span>
      </div>
      <span className="text-white font-bold text-xl md:text-2xl tracking-wide">Rent</span>
    </Link>
  );
}
