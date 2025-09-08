import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { pageEnter, buttonHoverTap, inputFocus, textareaFocus } from '../config/animations';
import { container, inputBase, textareaBase, buttonPrimary } from '../config/styles';
import SearchBar from '../components/SearchBar';
import NotesList from '../components/NotesList';
import useDebounce from '../hooks/useDebounce';
import { createNote, fetchNotes, type NoteListItem } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import TopBar from '../components/TopBar';

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
    onMutate: async () => {
      // Cancel outgoing fetches for any notes lists
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const key = ['notes', debounced] as const;
      const previous = queryClient.getQueryData<NoteListItem[]>(key) ?? [];
      const optimistic: NoteListItem = {
        id: -Date.now(),
        title: title.trim(),
        excerpt: content.length > 160 ? content.slice(0, 160) + '…' : content,
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<NoteListItem[]>(key, [optimistic, ...previous]);
      return { key, previous } as { key: readonly [string, string]; previous: NoteListItem[] };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.key, ctx.previous);
      alert('Create failed. You may need to login again.');
      logout();
      navigate('/login');
    },
    onSuccess: async () => {
      setTitle('');
      setContent('');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    <>
      <TopBar
        left={<div className="text-2xl font-extralight tracking-tight">Notes</div>}
        right={
          <button onClick={logout} className="text-gray-300/80 hover:text-white transition px-2 py-1">
            Logout
          </button>
        }
      />
      <motion.div className={`${container} pt-24`} {...pageEnter}>
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
      </div>
      </motion.div>
    </>
  );
};

export default Home;
