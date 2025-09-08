import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { NoteListItem } from '../api';
import { hoverScaleSmall, listItemEnter } from '../config/animations';
import { cardBase } from '../config/styles';

type Props = { note: NoteListItem };

const Note = ({ note }: Props) => {
  const navigate = useNavigate();
  return (
    <motion.li
      {...listItemEnter}
      className={`${cardBase} transition-colors duration-200 hover:bg-white/10 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-indigo-400/60`}
    >
      <motion.div {...hoverScaleSmall}>
        <Link
          to={`/notes/${note.id}`}
          className="block p-5 focus-visible:outline-none"
          data-note-link
          data-id={String(note.id)}
          onFocus={() => sessionStorage.setItem('notesFocus', `note:${note.id}`)}
          onClick={() => sessionStorage.setItem('notesFocus', `note:${note.id}`)}
          onKeyDown={(e) => {
            const isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
            const isEnter = e.key === 'Enter';
            const isArrowDown = e.key === 'ArrowDown';
            const isArrowUp = e.key === 'ArrowUp';
            const isArrowRight = e.key === 'ArrowRight' || e.code === 'ArrowRight';

            if (isArrowDown || isArrowUp) {
              e.preventDefault();
              const links = Array.from(
                document.querySelectorAll<HTMLAnchorElement>('a[data-note-link]'),
              );
              const idx = links.indexOf(e.currentTarget);
              if (idx >= 0) {
                if (isArrowDown) {
                  const next = links[idx + 1];
                  if (next) next.focus();
                } else if (isArrowUp) {
                  const prev = links[idx - 1];
                  if (prev) prev.focus();
                  else {
                    const search = document.getElementById('notes-search') as HTMLInputElement | null;
                    if (search) search.focus();
                  }
                }
              }
              return;
            }

            if (isSpace || isEnter || isArrowRight) {
              e.preventDefault();
              navigate(`/notes/${note.id}`);
            }
          }}
        >
          <div className="font-medium tracking-tight text-lg">{note.title}</div>
          <div className="text-gray-400 mt-1 text-sm leading-6">{note.excerpt}</div>
          <div className="text-gray-500 mt-2 text-xs">
            Updated {new Date(note.updatedAt).toLocaleString()}
          </div>
        </Link>
      </motion.div>
    </motion.li>
  );
};

export default Note;
