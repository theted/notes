import type { MotionProps, Transition, Variants } from 'framer-motion';

// Every page: one orchestrated load sequence; children with `enterItem` rise in turn
export const enterSequence: MotionProps = {
  initial: 'hidden',
  animate: 'show',
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  },
};

// Every page: everything leaves together, blurred, as the next page arrives
export const leaveBlur: MotionProps = {
  exit: { opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: 0.35, ease: 'easeIn' } },
};

// Swooshy fade-in-up with a subtle spring
export const enterItem: MotionProps = {
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

// Headlines (splash remix, greeting, note titles): words blur in from below, and on a remix blur
// out upward. `custom` delays the first word, e.g. so the splash headline lands after the wordmark.
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

// Drifting colour behind the signed-in pages: eases in as the splash blurs away
export const auroraFade: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 1.6, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } },
};

// TopBar contents fade in with each page; the bar itself stays put
export const topBarFade: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// Note cards continue the page sequence, a beat apart; search results pop in and out
export const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const listItemEnter: MotionProps = {
  ...enterItem,
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } },
  layout: 'position',
};

export const cardLift: MotionProps = {
  whileHover: { y: -3 },
  whileTap: { scale: 0.99 },
  transition: { type: 'spring', stiffness: 400, damping: 28 },
};

// Note content: dims and blurs while a remix cooks, then the new version blurs in
export const contentSwap: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  busy: { opacity: 0.35, filter: 'blur(3px)', transition: { duration: 0.6, ease: 'easeOut' } },
  leave: { opacity: 0, filter: 'blur(8px)', transition: { duration: 0.25, ease: 'easeIn' } },
};

export const dialogEnter: MotionProps = {
  initial: { opacity: 0, y: 18, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, y: 8, scale: 0.985, transition: { duration: 0.15, ease: 'easeIn' } },
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
