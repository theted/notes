import { useEffect } from 'react';
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'framer-motion';
import { pointerSpring } from '../config/animations';

export type Pointer = { x: MotionValue<number>; y: MotionValue<number> };

// The pointer's position over the window, -1..1 on each axis from the centre, eased by a spring.
// Stays at 0 on touch screens and with reduced motion, so anything it drives holds still.
export const usePointer = (): Pointer => {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, pointerSpring);
  const y = useSpring(rawY, pointerSpring);

  useEffect(() => {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion, rawX, rawY]);

  return { x, y };
};
