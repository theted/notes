import React from 'react';
import { motion } from 'framer-motion';
import { remixWord } from '../config/animations';

// Words that blur in one after another; put them in an element with `variants={remixLine}`
const BlurWords = ({ text }: { text: string }) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <motion.span className="inline-block" variants={remixWord}>
          {word}
        </motion.span>{' '}
      </React.Fragment>
    ))}
  </>
);

export default BlurWords;
