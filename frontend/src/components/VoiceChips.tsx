import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { pillSlide } from '../config/animations';
import { chipBase, chipPill } from '../config/styles';
import type { Voice } from '../config/voices';
import { cn } from '../lib/utils';

type Props = {
  voices: readonly Voice[];
  activeId: string;
  onPick: (id: string) => void;
  disabled?: boolean;
  // Drawn inside the active pill: the splash's countdown to the next voice, a note's remix at work
  indicator?: React.ReactNode;
  className?: string;
};

// "Remix as" and a chip per voice, with a pill that slides to the active one
const VoiceChips = ({ voices, activeId, onPick, disabled, indicator, className }: Props) => {
  const pillId = useId();
  return (
    <div className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-2', className)}>
      <span className="mr-1.5 text-sm text-gray-400">Remix as</span>
      {voices.map((v) => {
        const active = v.id === activeId;
        return (
          <button
            key={v.id}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onPick(v.id)}
            className={cn(
              chipBase,
              'disabled:cursor-wait',
              active ? 'text-white' : 'text-gray-400 enabled:hover:text-gray-200',
            )}
          >
            {active && (
              <motion.span layoutId={pillId} transition={pillSlide} className={chipPill}>
                {indicator}
              </motion.span>
            )}
            {v.label}
          </button>
        );
      })}
    </div>
  );
};

export default VoiceChips;
