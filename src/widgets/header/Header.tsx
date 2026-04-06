import React from 'react';
import { Logo } from '@/src/shared/ui/logo';
import Link from 'next/link';

interface HeaderProps {
  phone: string;
  phoneHref: string;
}

export function Header({ phone, phoneHref }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-dark bg-opacity-95 backdrop-blur-sm border-b border-gray-800 text-white shadow-sm">
      <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-12 text-sm font-medium">
          <Link href="#catalog" className="hover:text-primary transition-colors">Каталог</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">Как это работает</Link>
          <Link href="#advantages" className="hover:text-primary transition-colors">Преимущества</Link>
          <Link href="#contacts" className="hover:text-primary transition-colors">Контакты</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <a href={phoneHref} className="font-bold tracking-wide hover:text-primary transition-colors px-1">
            {phone}
          </a>
        </div>
      </div>
    </header>
  );
}
