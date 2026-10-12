import type { MotionProps, Transition, Variants } from 'framer-motion';

export const pageEnter: MotionProps = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: { duration: 0.25 },
};

// Content pages with slower fade-out for nicer logout transition
export const pageEnterSlowExit: MotionProps = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8, transition: { duration: 0.5 } },
  transition: { duration: 0.25 },
};

export const headlineEnter: MotionProps = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.25 },
};

// Splash: one orchestrated load sequence; children enter in turn
export const splashSequence: MotionProps = {
  initial: 'hidden',
  animate: 'show',
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  },
};

// Splash: everything leaves together, blurred, when the notebook opens
export const splashLeave: MotionProps = {
  exit: { opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: 0.35, ease: 'easeIn' } },
};

// Splash: swooshy fade-in-up with a subtle spring
export const splashItem: MotionProps = {
  variants: {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 260, damping: 24, mass: 0.9 },
    },
  },
};

// Remixing headline: words blur out upward, the next voice's words blur in from below.
// `custom` delays the first line, so it lands after the wordmark on page load.
export const remixLine: Variants = {
  hidden: {},
  show: (delay: number = 0) => ({ transition: { staggerChildren: 0.035, delayChildren: delay } }),
  leave: { transition: { staggerChildren: 0.02 } },
};

export const remixWord: Variants = {
  hidden: { opacity: 0, y: '0.35em', filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  leave: {
    opacity: 0,
    y: '-0.25em',
    filter: 'blur(8px)',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// Active-voice pill sliding between chips (shared layoutId)
export const pillSlide: Transition = { type: 'spring', stiffness: 380, damping: 32 };

// Voice-tinted glow crossfade behind the headline
export const glowFade: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 1.2, ease: 'easeInOut' },
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
      transition: { staggerChildren: 0.14, delayChildren: 0.08 },
    },
  },
};

// Individual item zoom/opacity for staggered entrance
export const listItemEnter: MotionProps = {
  variants: {
    hidden: { opacity: 0, scale: 0.985, y: 8 },
    show: { opacity: 1, scale: 1, y: 0 },
  },
  exit: { opacity: 0, scale: 0.98, y: 6 },
  transition: { duration: 0.2, ease: 'easeOut' },
  layout: true,
};
