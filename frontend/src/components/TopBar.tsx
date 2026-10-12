import React from 'react';
import { motion } from 'framer-motion';
import { topBarFade } from '../config/animations';
import { column } from '../config/styles';

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

const TopBar: React.FC<Props> = ({ left, right }) => (
  <header className="fixed top-0 inset-x-0 z-40 bg-ink/40 backdrop-blur-xl">
    <motion.div className={`${column} h-16 flex items-center gap-3`} {...topBarFade}>
      <div className="min-w-0 flex items-center gap-2">{left}</div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">{right}</div>
    </motion.div>
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
    />
  </header>
);

export default TopBar;
