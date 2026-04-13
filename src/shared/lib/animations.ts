import { Easing } from 'framer-motion';

export const transition = {
  duration: 1.2,
  ease: [0.16, 1, 0.3, 1] as unknown as Easing, // Cinematic custom cubic-bezier
};

export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition,
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const revealScale = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition,
};
