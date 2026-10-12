import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { NoteListItem } from '../api';
import { cardLift, listItemEnter } from '../config/animations';
import { noteCard } from '../config/styles';
import MarkdownExcerpt from './MarkdownExcerpt';

type Props = { note: NoteListItem };

// Feeds the card's spotlight its position
const trackPointer = (e: React.PointerEvent<HTMLElement>) => {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - top}px`);
};

const Note = ({ note }: Props) => {
  const navigate = useNavigate();
  return (
    <motion.li {...listItemEnter}>
      <motion.div {...cardLift}>
        <Link
          to={`/notes/${note.id}`}
          className={noteCard}
          onPointerMove={trackPointer}
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
                    const search = document.getElementById(
                      'notes-search',
                    ) as HTMLInputElement | null;
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
          {/* Above the spotlight */}
          <div className="relative">
            <div className="text-xl font-light tracking-tight text-white">{note.title}</div>
            <MarkdownExcerpt content={note.excerpt} />
            <div className="text-gray-500 mt-3 text-xs">
              Updated {new Date(note.updatedAt).toLocaleString()}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.li>
  );
};

export default Note;
