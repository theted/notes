import React from 'react';
import { motion, useTransform } from 'framer-motion';
import type { Pointer } from '../hooks/usePointer';
import { ghostCard } from '../config/styles';
import { cn } from '../lib/utils';

// How far away a ghost note sits: nearer ones are larger, sharper, and shift more with the pointer
const DEPTHS = {
  far: { card: 'w-40 opacity-30 blur-[3px]', title: 'text-xs', shift: 10 },
  mid: { card: 'w-48 opacity-50 blur-[1.5px]', title: 'text-sm', shift: 20 },
  near: { card: 'w-56 opacity-70', title: 'text-sm', shift: 34 },
} as const;

type Ghost = {
  title: string;
  lines: string[];
  place: string;
  depth: keyof typeof DEPTHS;
  float: string;
};

const GHOSTS: Ghost[] = [
  {
    title: 'Groceries',
    lines: ['w-3/4', 'w-1/2', 'w-2/3'],
    place: 'left-[76%] top-[1%]',
    depth: 'mid',
    float: 'motion-safe:animate-float-a',
  },
  {
    title: 'Standup notes',
    lines: ['w-5/6', 'w-2/3'],
    place: 'left-[84%] top-[17%]',
    depth: 'near',
    float: 'motion-safe:animate-float-b',
  },
  {
    title: 'Book quotes',
    lines: ['w-full', 'w-4/5', 'w-1/2'],
    place: 'left-[50%] top-[-3%]',
    depth: 'far',
    float: 'motion-safe:animate-float-c',
  },
  {
    title: 'Trip to Lisbon',
    lines: ['w-2/3', 'w-5/6'],
    place: 'left-[93%] top-[46%]',
    depth: 'far',
    float: 'motion-safe:animate-float-a',
  },
  {
    title: 'Gift ideas',
    lines: ['w-1/2', 'w-3/4'],
    place: 'left-[58%] top-[86%]',
    depth: 'near',
    float: 'motion-safe:animate-float-c',
  },
  {
    title: 'Shakshuka',
    lines: ['w-4/5', 'w-2/3', 'w-3/4'],
    place: 'left-[79%] top-[90%]',
    depth: 'mid',
    float: 'motion-safe:animate-float-b',
  },
  {
    title: 'Bike repair',
    lines: ['w-2/3', 'w-1/2'],
    place: 'left-[96%] top-[72%]',
    depth: 'mid',
    float: 'motion-safe:animate-float-c',
  },
  {
    title: 'Ideas',
    lines: ['w-3/5', 'w-4/5'],
    place: 'left-[64%] top-[93%]',
    depth: 'far',
    float: 'motion-safe:animate-float-b',
  },
];

const GhostNote = ({ ghost, pointer }: { ghost: Ghost; pointer: Pointer }) => {
  const depth = DEPTHS[ghost.depth];
  // Drifts against the pointer, so the near notes seem to float in front of the far ones
  const x = useTransform(pointer.x, (v) => v * -depth.shift);
  const y = useTransform(pointer.y, (v) => v * -depth.shift);
  return (
    <motion.div className={cn('absolute', ghost.place)} style={{ x, y }}>
      <div className={ghost.float}>
        <div className={cn(ghostCard, depth.card)}>
          <div className={cn('font-light text-gray-200', depth.title)}>{ghost.title}</div>
          <div className="mt-3 space-y-2">
            {ghost.lines.map((w, i) => (
              <div key={i} className={cn('h-1.5 rounded-full bg-white/15', w)} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// The splash's backdrop: other people's notebooks drifting by, out of focus, on the right of the
// page where the text isn't. Hidden on narrow screens, where there is no room beside the text.
const NoteCloud = ({ pointer }: { pointer: Pointer }) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block [mask-image:linear-gradient(to_right,transparent_35%,black_70%)]"
  >
    {GHOSTS.map((ghost) => (
      <GhostNote key={ghost.title} ghost={ghost} pointer={pointer} />
    ))}
  </div>
);

export default NoteCloud;
