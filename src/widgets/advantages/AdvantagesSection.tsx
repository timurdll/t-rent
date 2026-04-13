import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/src/shared/ui/section';
import { Typography } from '@/src/shared/ui/typography';
import { Clock, FileCheck, HeadphonesIcon, Truck } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/src/shared/lib/animations';

const ADVANTAGES = [
  {
    icon: <Truck className="w-10 h-10 text-primary" />,
    title: 'Быстрая доставка',
    description: 'В день заказа в Астане и Алматы. По всему Казахстану',
  },
  {
    icon: <FileCheck className="w-10 h-10 text-primary" />,
    title: 'Договор аренды',
    description: 'Юридически защищено',
  },
  {
    icon: <Clock className="w-10 h-10 text-primary" />,
    title: 'Гибкие сроки',
    description: 'От 1 дня до 3 месяцев',
  },
  {
    icon: <HeadphonesIcon className="w-10 h-10 text-primary" />,
    title: 'Поддержка 24/7',
    description: 'На связи в любое время',
  },
];

export function AdvantagesSection() {
  return (
    <Section id="advantages" bg="white">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={fadeInUp}>
          <Typography variant="h2" className="text-dark">Наши преимущества</Typography>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 px-4"
        >
          {ADVANTAGES.map((adv, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-full mb-4 border border-gray-100 shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                  {adv.icon}
              </div>
              <h3 className="text-lg font-bold text-dark mb-1">{adv.title}</h3>
              <p className="text-gray-500 font-medium text-sm">{adv.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  );
}
