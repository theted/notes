import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { pageEnter, buttonHoverTap, inputFocus, textareaFocus } from '../config/animations';
import { container, headline, inputBase, textareaBase, buttonPrimary } from '../config/styles';
import SearchBar from '../components/SearchBar';
import NotesList from '../components/NotesList';
import useDebounce from '../hooks/useDebounce';
import { createNote, fetchNotes, type NoteListItem } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

const Home = () => {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);
  const [error] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isFetching, isLoading } = useQuery<NoteListItem[]>({
    queryKey: ['notes', debounced],
    queryFn: () => fetchNotes(debounced),
    placeholderData: keepPreviousData,
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const canCreate = useMemo(() => title.trim().length > 0, [title]);

  const createMutation = useMutation({
    mutationFn: () => createNote(title.trim(), content),
    onSuccess: async () => {
      setTitle('');
      setContent('');
      // Invalidate all notes queries so list refetches
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      alert('Create failed. You may need to login again.');
      logout();
      navigate('/login');
    },
  });

  const onCreate = async () => {
    await createMutation.mutateAsync();
  };

  const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && canCreate) {
      e.preventDefault();
      void onCreate();
    }
  };

  return (
    <motion.div className={container} {...pageEnter}>
      <header className="mb-8">
        <h1 className={headline}>Notes</h1>
      </header>
      <SearchBar value={query} onChange={setQuery} />
      {(isFetching || isLoading) && <div className="mt-2 text-gray-400">Searching…</div>}
      {error && <div className="mt-3 text-red-400">{error}</div>}
      <div className="mt-5">
        <NotesList notes={data ?? []} />
      </div>

      <div className="my-10 h-px bg-white/10" />
      <h2 className="text-2xl font-extralight tracking-tight mb-4">New Note</h2>
      <motion.input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onTitleKeyDown}
        placeholder="Title"
        className={inputBase}
        {...inputFocus}
      />
      <motion.textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={6}
        className={textareaBase}
        {...textareaFocus}
      />
      <div className="mt-4 flex items-center gap-4">
        <motion.button
          disabled={!canCreate}
          onClick={onCreate}
          className={`${buttonPrimary} px-5 py-3 text-lg`}
          {...(canCreate ? buttonHoverTap : {})}
        >
          Create
        </motion.button>
        <div className="flex-1" />
        <motion.button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg bg-white/10 transition"
          {...buttonHoverTap}
        >
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Home;
