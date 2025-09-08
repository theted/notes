import type { MotionProps } from 'framer-motion';

export const pageEnter: MotionProps = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: { duration: 0.25 },
};

export const headlineEnter: MotionProps = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.25 },
};

export const cardItem: MotionProps = {
  layout: true,
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

export const hoverScaleSmall: MotionProps = {
  whileHover: { scale: 1.01 },
  transition: { duration: 0.15 },
};

export const inputFocus: MotionProps = {
  whileFocus: { scale: 1.01 },
  transition: { type: 'spring', stiffness: 300, damping: 24 },
};

export const textareaFocus: MotionProps = {
  whileFocus: { scale: 1.005 },
  transition: { type: 'spring', stiffness: 300, damping: 26 },
};

export const buttonHoverTap: MotionProps = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.12 },
};

// Staggered list container for notes
export const listStagger: MotionProps = {
  initial: 'hidden',
  animate: 'show',
  exit: 'hidden',
  variants: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.06, delayChildren: 0.02 },
    },
  },
};

// Individual item zoom/opacity for staggered entrance
export const listItemEnter: MotionProps = {
  variants: {
    hidden: { opacity: 0, scale: 0.985 },
    show: { opacity: 1, scale: 1 },
  },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeOut' },
  layout: true,
};
