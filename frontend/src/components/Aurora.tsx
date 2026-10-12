import React from 'react';
import { motion } from 'framer-motion';
import { auroraFade } from '../config/animations';
import { cn } from '../lib/utils';

const BLOBS = [
  'left-[-24vmax] top-[-28vmax] h-[72vmax] w-[82vmax] bg-[radial-gradient(closest-side,rgba(99,102,241,0.3),transparent)] motion-safe:animate-drift-a',
  'right-[-30vmax] top-[6vh] h-[66vmax] w-[66vmax] bg-[radial-gradient(closest-side,rgba(45,212,191,0.17),transparent)] motion-safe:animate-drift-b',
  'bottom-[-36vmax] left-[8vw] h-[72vmax] w-[88vmax] bg-[radial-gradient(closest-side,rgba(192,132,252,0.19),transparent)] motion-safe:animate-drift-c',
];

// Slow-drifting colour behind the signed-in pages (the splash brings its own glow). Mounted once
// above the routes, so it carries on through page changes instead of restarting with each one.
const Aurora = () => (
  <motion.div
    aria-hidden
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    {...auroraFade}
  >
    {BLOBS.map((blob) => (
      <div key={blob} className={cn('absolute', blob)} />
    ))}
  </motion.div>
);

export default Aurora;
