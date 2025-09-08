import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { NoteListItem } from '../api';
import Note from './Note';
import { listStagger } from '../config/animations';

type Props = { notes: NoteListItem[] };

const NotesList = ({ notes }: Props) => {
  if (!notes.length) return <div className="text-gray-400">No notes found.</div>;
  return (
    <AnimatePresence initial={false}>
      <motion.ul className="space-y-4" {...listStagger}>
        {notes.map((n) => (
          <Note key={n.id} note={n} />
        ))}
      </motion.ul>
    </AnimatePresence>
  );
};

export default NotesList;
