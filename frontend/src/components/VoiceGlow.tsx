import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { glowFade } from '../config/animations';
import type { Voice } from '../config/voices';
import { cn } from '../lib/utils';

type Props = { voice: Voice; busy?: boolean };

// The active voice's tint behind the headline: crossfades between voices, breathes while busy.
// Fills its nearest positioned ancestor, so put content after it in a `relative` box.
const VoiceGlow = ({ voice, busy = false }: Props) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className={cn('absolute inset-0', busy && 'motion-safe:animate-pulse')}>
      <AnimatePresence initial={false}>
        <motion.div
          key={voice.id}
          className={cn(
            'absolute -left-[20vmax] -top-[12vmax] w-[85vmax] h-[65vmax] blur-2xl',
            voice.glow,
          )}
          {...glowFade}
        />
      </AnimatePresence>
    </div>
  </div>
);

export default VoiceGlow;
