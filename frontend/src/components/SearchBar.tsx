import React from 'react';
import { motion } from 'framer-motion';
import { inputFocus } from '../config/animations';
import Input from './ui/input';

type Props = { value: string; onChange: (v: string) => void; placeholder?: string };

const SearchBar = ({ value, onChange, placeholder }: Props) => (
  <motion.div {...inputFocus}>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Search notes…'}
    />
  </motion.div>
);

export default SearchBar;
