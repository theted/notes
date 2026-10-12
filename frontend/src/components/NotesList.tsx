import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { NoteListItem } from '../api';
import Note from './Note';
import { enterItem, listStagger } from '../config/animations';

type Props = { notes: NoteListItem[] };

// Inherits the page's load sequence, so the cards cascade in right after the search bar
const NotesList = ({ notes }: Props) =>
  notes.length ? (
    <motion.ul className="space-y-4" variants={listStagger}>
      <AnimatePresence>
        {notes.map((n) => (
          <Note key={n.id} note={n} />
        ))}
      </AnimatePresence>
    </motion.ul>
  ) : (
    <motion.p className="py-16 text-center text-gray-400" {...enterItem}>
      Nothing matches that. Try fewer letters?
    </motion.p>
  );

export default NotesList;
