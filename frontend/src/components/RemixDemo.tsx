import React from 'react';
import { AnimatePresence, motion, useReducedMotion, useTransform } from 'framer-motion';
import { remixLine, demoFloat, demoSweep } from '../config/animations';
import { demoCard } from '../config/styles';
import type { Voice } from '../config/voices';
import type { Pointer } from '../hooks/usePointer';
import BlurWords from './BlurWords';

type Props = { voice: Voice; pointer: Pointer };

// The splash's sample note, rewritten in the active voice (the persona's real output), so the
// headline's remix is shown on an actual note. Floats, and tilts toward the pointer.
const RemixDemo = ({ voice, pointer }: Props) => {
  const reduceMotion = useReducedMotion();
  const rotateY = useTransform(pointer.x, (v) => v * 8);
  const rotateX = useTransform(pointer.y, (v) => v * -8);
  const lines = voice.sample.split('\n').filter(Boolean);

  return (
    <motion.div {...(reduceMotion ? {} : demoFloat)}>
      <motion.figure
        className={demoCard}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        aria-label={`A sample note, ${voice.id === 'plain' ? 'as written' : `remixed as ${voice.label}`}`}
      >
        {/* A band of light runs along the top edge each time the note is remixed */}
        <AnimatePresence initial={false}>
          <motion.span
            key={voice.id}
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/90 to-transparent"
            {...demoSweep}
          />
        </AnimatePresence>

        <figcaption className="flex items-baseline justify-between gap-4">
          <span className="text-xl font-extralight tracking-tight text-white">Plant care</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={voice.id}
              className="text-xs text-gray-400"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {voice.id === 'plain' ? 'Original' : `Remixed as ${voice.label}`}
            </motion.span>
          </AnimatePresence>
        </figcaption>

        <div className="mt-4 text-[0.95rem] xl:min-h-[11rem] font-light leading-relaxed text-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={voice.id}
              className="space-y-3"
              variants={remixLine}
              initial="hidden"
              animate="show"
              exit="leave"
            >
              {lines.map((line, i) =>
                line.startsWith('- ') ? (
                  <p key={i} className="flex gap-2.5">
                    <span aria-hidden className="text-indigo-300/70">
                      •
                    </span>
                    <span>
                      <BlurWords text={line.slice(2)} />
                    </span>
                  </p>
                ) : (
                  <p key={i}>
                    <BlurWords text={line} />
                  </p>
                ),
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.figure>
    </motion.div>
  );
};

export default RemixDemo;
