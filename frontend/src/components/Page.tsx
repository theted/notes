import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { enterSequence, leaveBlur } from '../config/animations';

type Props = { className?: string; children: React.ReactNode };

// Every page's choreography: children spreading `enterItem` rise in turn, and the whole page blurs
// out as the next one arrives. Keep fixed layers (TopBar, Modal) outside: the exit's filter and
// transform would re-anchor them to this box.
const Page = ({ className, children }: Props) => (
  <motion.div className={className} {...leaveBlur}>
    {/* Own presence boundary: the router's AnimatePresence skips initial animations on a hard load */}
    <AnimatePresence>
      <motion.div key="page" {...enterSequence}>
        {children}
      </motion.div>
    </AnimatePresence>
  </motion.div>
);

export default Page;
