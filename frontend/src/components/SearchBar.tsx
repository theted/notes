import React from 'react';
import { motion } from 'framer-motion';
import { inputFocus } from '../config/animations';
import Input from './ui/input';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

const SearchBar = ({ value, onChange, placeholder, id, inputRef, onFocus, onKeyDown }: Props) => (
  <motion.div {...inputFocus}>
    <Input
      id={id}
      ref={inputRef as any}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      placeholder={placeholder || 'Search notes…'}
    />
  </motion.div>
);

export default SearchBar;
