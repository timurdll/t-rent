import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/src/shared/ui/section';
import { Typography } from '@/src/shared/ui/typography';
import { Button } from '@/src/shared/ui/button';
import { fadeInUp, transition } from '@/src/shared/lib/animations';

interface CtaSectionProps {
  onRentClick: () => void;
}

export function CtaSection({ onRentClick }: CtaSectionProps) {
  return (
    <Section bg="dark" className="text-center py-20 bg-gradient-to-t from-black to-dark overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={transition}
        className="max-w-2xl mx-auto flex flex-col items-center"
      >
        <Typography variant="h2" className="text-white mb-2 text-3xl md:text-4xl">
          Нужна техника уже сегодня?
        </Typography>
        <p className="text-gray-300 text-lg md:text-xl mb-10 font-medium">
          Оставьте заявку и получите расчет за <span className="font-bold text-white">5 минут</span>
        </p>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" onClick={onRentClick} className="font-bold px-12 py-6 text-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            Арендовать
          </Button>
        </motion.div>
      </motion.div>
    </Section>
  );
}
