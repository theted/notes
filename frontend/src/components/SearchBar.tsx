import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { inputFocus } from '../config/animations';
import { searchInput, sweep } from '../config/styles';
import { cn } from '../lib/utils';
import Input from './ui/input';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  // A light sweeps along the bottom edge while results load
  busy?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

const SearchBar = ({
  value,
  onChange,
  placeholder,
  id,
  inputRef,
  busy = false,
  onFocus,
  onKeyDown,
}: Props) => (
  <motion.div className="relative" {...inputFocus}>
    <Input
      id={id}
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      aria-label="Search notes"
      placeholder={placeholder || 'Search notes…'}
      className={searchInput}
    />
    {/* After the input: its backdrop blur would paint over an earlier sibling */}
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
    >
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <AnimatePresence>
      {busy && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-5 bottom-0 h-px overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={cn(sweep, 'via-indigo-300')} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default SearchBar;
