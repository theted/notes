import React from 'react';
import { motion } from 'framer-motion';
import { inputFocus } from '../config/animations';
import { inputBase } from '../config/styles';

type Props = { value: string; onChange: (v: string) => void; placeholder?: string };

const SearchBar = ({ value, onChange, placeholder }: Props) => (
  <motion.input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder || 'Search notes…'}
    className={inputBase}
    {...inputFocus}
  />
);

export default SearchBar;
