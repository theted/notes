import React from 'react';
import { AnimatePresence } from 'framer-motion';
import type { NoteListItem } from '../api';
import Note from './Note';

type Props = { notes: NoteListItem[] };

const NotesList = ({ notes }: Props) => {
  if (!notes.length) return <div className="text-gray-400">No notes found.</div>;
  return (
    <ul className="space-y-4">
      <AnimatePresence initial={false}>
        {notes.map((n) => (
          <Note key={n.id} note={n} />
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default NotesList;
