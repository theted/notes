import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteNote, fetchNote, updateNote, remixNote, fetchPersonas, type Note } from '../api';
import type { NoteListItem } from '../api';
import { motion } from 'framer-motion';
import {
  pageEnter,
  buttonHoverTap,
  inputFocus,
  textareaFocus,
  headlineEnter,
} from '../config/animations';
import { container, headline } from '../config/styles';
import { useAuth } from '../auth/AuthContext';
import TopBar from '../components/TopBar';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Button from '../components/ui/button';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../components/ui/dropdown';
import Markdown from '../components/Markdown';

const NoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [persona, setPersona] = useState<string>('');
  const [isRemixing, setIsRemixing] = useState(false);
  const [error] = useState<string | null>(null);
  const { logout } = useAuth();

  const queryClient = useQueryClient();
  const { data: note, isFetching, isLoading } = useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: () => fetchNote(noteId),
    placeholderData: keepPreviousData,
  });
  const { data: personas, isLoading: personasLoading } = useQuery<string[]>({
    queryKey: ['personas'],
    queryFn: fetchPersonas,
    staleTime: 60 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: () => updateNote(noteId, title, content),
    onSuccess: (n) => {
      setEditing(false);
      queryClient.setQueryData(['note', noteId], n);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      alert('Update failed. You may need to login again.');
      logout();
      navigate('/login');
    },
  });

  const onSave = async () => {
    await updateMutation.mutateAsync();
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const prevNote = queryClient.getQueryData<Note>(['note', noteId]);
      const prevLists = queryClient.getQueriesData<NoteListItem[]>({ queryKey: ['notes'] });
      // Optimistically remove from notes lists
      prevLists.forEach(([key, list]) => {
        if (!list) return;
        queryClient.setQueryData<NoteListItem[]>(key as unknown as readonly [string, string], list.filter((n) => n.id !== noteId));
      });
      // Clear note cache
      queryClient.removeQueries({ queryKey: ['note', noteId] });
      return { prevNote, prevLists } as const;
    },
    onError: (_e, _v, ctx) => {
      // Rollback
      if (ctx?.prevNote) queryClient.setQueryData(['note', noteId], ctx.prevNote);
      ctx?.prevLists.forEach(([key, list]) =>
        queryClient.setQueryData<NoteListItem[]>(
          key as unknown as readonly [string, string],
          list,
        ),
      );
      alert('Delete failed. You may need to login again.');
      logout();
      navigate('/login');
    },
    onSuccess: async () => {
      navigate('/');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const onDelete = async () => {
    if (!confirm('Delete this note?')) return;
    await deleteMutation.mutateAsync();
  };

  const remixMutation = useMutation({
    mutationFn: (p: string) => remixNote(noteId, p),
    onMutate: async (p) => {
      setIsRemixing(true);
      if (originalContent == null && note) setOriginalContent(note.content);
      return p;
    },
    onSuccess: (n) => {
      queryClient.setQueryData(['note', noteId], n);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      alert('Remix failed.');
    },
    onSettled: () => setIsRemixing(false),
  });

  const onUndo = async () => {
    if (originalContent == null || !note) return;
    // restore on server and cache
    const restored = await updateNote(noteId, note.title, originalContent);
    queryClient.setQueryData(['note', noteId], restored);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    setOriginalContent(null);
  };

  if (error) return <div className="p-6">Error: {error}</div>;
  if (!note && (isLoading || isFetching)) return <div className="p-6">Loading…</div>;
  if (!note) return <div className="p-6">Not found</div>;

  return (
    <>
      <TopBar
        left={<Link to="/" className="text-gray-300 hover:text-white transition">← Back</Link>}
        right={
          <>
            {!editing && (
              <motion.div {...buttonHoverTap}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTitle(note?.title ?? '');
                    setContent(note?.content ?? '');
                    setEditing(true);
                  }}
                >
                  Edit
                </Button>
              </motion.div>
            )}
            <motion.div {...buttonHoverTap}>
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </>
        }
      />
      <motion.div className={`${container} pt-32 md:pt-36`} {...pageEnter}>
      {editing ? (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div {...inputFocus}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </motion.div>
          <motion.div {...textareaFocus}>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} />
          </motion.div>
          <div className="mt-3 flex gap-2">
            <motion.div {...buttonHoverTap}>
              <Button onClick={onSave}>Save</Button>
            </motion.div>
            <motion.div {...buttonHoverTap}>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.h1 className={headline} {...headlineEnter}>{note.title}</motion.h1>
          <Markdown content={note.content} />
          <div className="text-gray-400 mt-4 text-sm">
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="text-sm">
                {isRemixing ? 'Remixing…' : persona ? `Persona: ${persona}` : 'AI remix'}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem
                  onClick={() => {
                    setPersona('');
                  }}
                >
                  Clear
                </DropdownItem>
                {(personas ?? ['funny', 'corporate', 'silly', 'overfriendly', 'sarcastic', 'summary-scholar']).map((p) => (
                  <DropdownItem
                    key={p}
                    onClick={async () => {
                      setPersona(p);
                      await remixMutation.mutateAsync(p);
                    }}
                  >
                    {p === 'summary-scholar' ? 'Summary scholar' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
            {personasLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-transparent animate-spin" />
                <span>Loading personas…</span>
              </div>
            )}
            {originalContent != null && (
              <button onClick={onUndo} className="text-gray-300/80 hover:text-white transition px-2 py-1 text-sm">Undo</button>
            )}
            {isRemixing && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-transparent animate-spin" />
                <span>Transforming…</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </motion.div>
    </>
  );
};

export default NoteDetail;
