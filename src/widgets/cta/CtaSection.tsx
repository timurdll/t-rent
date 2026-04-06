import React from 'react';
import { Section } from '@/src/shared/ui/section';
import { Typography } from '@/src/shared/ui/typography';
import { Button } from '@/src/shared/ui/button';

interface CtaSectionProps {
  onRentClick: () => void;
}

export function CtaSection({ onRentClick }: CtaSectionProps) {
  return (
    <Section bg="dark" className="text-center py-20 bg-gradient-to-t from-black to-dark">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <Typography variant="h2" className="text-white mb-2 text-3xl md:text-4xl">
          Нужна техника уже сегодня?
        </Typography>
        <p className="text-gray-300 text-lg md:text-xl mb-10 font-medium">
          Оставьте заявку и получите расчет за <span className="font-bold text-white">5 минут</span>
        </p>
        
        <Button size="lg" onClick={onRentClick} className="font-bold px-12 py-6 text-lg">
          Арендовать
        </Button>
      </div>
    </Section>
  );
}
