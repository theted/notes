import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { NoteListItem } from '../api';
import { hoverScaleSmall, listItemEnter } from '../config/animations';
import { cardBase } from '../config/styles';

type Props = { note: NoteListItem };

const Note = ({ note }: Props) => (
  <motion.li {...listItemEnter} className={cardBase}>
    <motion.div {...hoverScaleSmall}>
      <Link to={`/notes/${note.id}`} className="block p-5">
        <div className="font-medium tracking-tight text-lg">{note.title}</div>
        <div className="text-gray-400 mt-1 text-sm leading-6">{note.excerpt}</div>
        <div className="text-gray-500 mt-2 text-xs">
          Updated {new Date(note.updatedAt).toLocaleString()}
        </div>
      </Link>
    </motion.div>
  </motion.li>
);

export default Note;
