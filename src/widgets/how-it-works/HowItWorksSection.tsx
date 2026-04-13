import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/src/shared/ui/section';
import { Typography } from '@/src/shared/ui/typography';
import { MousePointerClick, FileText, CheckCircle, Truck } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/src/shared/lib/animations';

const STEPS = [
  {
    icon: <MousePointerClick className="w-8 h-8 text-dark" />,
    title: 'Выбор техники',
    description: 'Выберите нужное устройство',
  },
  {
    icon: <FileText className="w-8 h-8 text-dark" />,
    title: 'Оставить заявку',
    description: 'Заполните форму на сайте',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-dark" />,
    title: 'Подтверждение',
    description: 'Подтверждаем заказ',
  },
  {
    icon: <Truck className="w-8 h-8 text-dark" />,
    title: 'Доставка',
    description: 'Доставим в срок',
  },
];

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" bg="white">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={fadeInUp}>
          <Typography variant="h2" className="text-dark">Как это работает</Typography>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
        >
          {STEPS.map((step, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeInUp}
              className="bg-gray-50 rounded-xl p-6 flex flex-col items-start shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4 text-primary bg-white rounded-full p-3 shadow-sm">
                 {step.icon}
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm font-medium">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  );
}
