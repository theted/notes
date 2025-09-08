import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteNote, fetchNote, updateNote, type Note } from '../api';
import { motion } from 'framer-motion';
import {
  pageEnter,
  buttonHoverTap,
  inputFocus,
  textareaFocus,
  headlineEnter,
} from '../config/animations';
import {
  container,
  buttonDanger,
  buttonGhost,
  inputBase,
  textareaBase,
  headline,
} from '../config/styles';
import { useAuth } from '../auth/AuthContext';
import TopBar from '../components/TopBar';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';

const NoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error] = useState<string | null>(null);
  const { logout } = useAuth();

  const queryClient = useQueryClient();
  const { data: note, isFetching, isLoading } = useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: () => fetchNote(noteId),
    placeholderData: keepPreviousData,
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
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['note', noteId] });
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/');
    },
    onError: () => {
      alert('Delete failed. You may need to login again.');
      logout();
      navigate('/login');
    },
  });

  const onDelete = async () => {
    if (!confirm('Delete this note?')) return;
    await deleteMutation.mutateAsync();
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
              <motion.button
                onClick={() => {
                  setTitle(note?.title ?? '');
                  setContent(note?.content ?? '');
                  setEditing(true);
                }}
                className={buttonGhost}
                {...buttonHoverTap}
              >
                Edit
              </motion.button>
            )}
            <motion.button onClick={onDelete} className={buttonDanger} {...buttonHoverTap}>
              Delete
            </motion.button>
            <motion.button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 transition"
              {...buttonHoverTap}
            >
              Logout
            </motion.button>
          </>
        }
      />
      <motion.div className={`${container} pt-24`} {...pageEnter}>
      {editing ? (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputBase}
            {...inputFocus}
          />
          <motion.textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className={textareaBase}
            {...textareaFocus}
          />
          <div className="mt-3 flex gap-2">
            <motion.button
              onClick={onSave}
              className="px-4 py-2 rounded-lg bg-indigo-500/90 transition"
              {...buttonHoverTap}
            >
              Save
            </motion.button>
            <motion.button
              onClick={() => setEditing(false)}
              className={buttonGhost}
              {...buttonHoverTap}
            >
              Cancel
            </motion.button>
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
          <pre className="whitespace-pre-wrap leading-7 text-gray-200 mt-4 font-sans">
            {note.content}
          </pre>
          <div className="text-gray-400 mt-4 text-sm">
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
        </motion.div>
      )}
      </motion.div>
    </>
  );
};

export default NoteDetail;
