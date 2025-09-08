import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteNote, fetchNote, updateNote, remixNote, fetchPersonas, type Note } from '../api';
import type { NoteListItem } from '../api';
import { AnimatePresence, motion } from 'framer-motion';
import { pageEnterSlowExit as pageEnter, buttonHoverTap, inputFocus, textareaFocus, headlineEnter } from '../config/animations';
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
  const [remixOpen, setRemixOpen] = useState(false);
  const [error] = useState<string | null>(null);
  const { logout } = useAuth();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [skeletonHeight, setSkeletonHeight] = useState<number>(0);
  const editTitleRef = useRef<HTMLInputElement | null>(null);
  const editContentRef = useRef<HTMLTextAreaElement | null>(null);
  const saveRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl+Space to save (when editing) or enter edit (when viewing)
      const isCtrlSpace = (e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ');
      if (isCtrlSpace) {
        // If focused in an input or textarea, let field-level handler manage it when editing
        const target = e.target as HTMLElement | null;
        const isField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
        if (editing && isField) return;
        e.preventDefault();
        if (editing) {
          void onSave();
        } else if (note) {
          setTitle(note.title);
          setContent(note.content);
          setEditing(true);
        }
        return;
      }

      // Esc to exit edit (back to detail) or from detail back to list
      if (e.key === 'Escape') {
        e.preventDefault();
        if (editing) setEditing(false);
        else navigate('/');
        return;
      }

      // Left arrow to go back to notes (view mode only to avoid hijacking text cursor)
      if (!editing && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft')) {
        e.preventDefault();
        navigate('/');
        return;
      }

      // Ctrl/Cmd + X to delete (view mode only)
      const isCtrlX = (e.ctrlKey || e.metaKey) && (e.code === 'KeyX' || e.key.toLowerCase() === 'x');
      if (!editing && isCtrlX) {
        e.preventDefault();
        void onDelete();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, note, navigate, onDelete]);

  // Keyboard up/down navigation among edit controls
  const editOrder = [editTitleRef, editContentRef, saveRef, cancelRef] as const;
  const moveEditFocus = (delta: 1 | -1, current: HTMLElement | null) => {
    const els = editOrder.map((r) => r.current).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const idx = els.indexOf(current as HTMLElement);
    const next = els[(idx + delta + els.length) % els.length];
    next?.focus();
  };

  // When entering edit mode, focus content field and restore caret
  useEffect(() => {
    if (!editing) return;
    requestAnimationFrame(() => {
      const el = editContentRef.current;
      if (!el) return;
      try {
        el.focus();
        // Try restore last cursor per note from localStorage; else place at end
        const keyStart = `noteCursorStart:${noteId}`;
        const keyEnd = `noteCursorEnd:${noteId}`;
        const savedStart = Number(localStorage.getItem(keyStart) ?? '');
        const savedEnd = Number(localStorage.getItem(keyEnd) ?? '');
        const len = el.value.length;
        if (Number.isFinite(savedStart) && Number.isFinite(savedEnd)) {
          const s = Math.max(0, Math.min(len, savedStart));
          const e = Math.max(0, Math.min(len, savedEnd));
          el.setSelectionRange(s, e);
        } else {
          el.setSelectionRange(len, len);
        }
      } catch {
        // no-op
      }
    });
  }, [editing, noteId]);

  // Persist caret position while editing (per note)
  useEffect(() => {
    if (!editing) return;
    const el = editContentRef.current;
    if (!el) return;
    const storeSel = () => {
      try {
        localStorage.setItem(`noteCursorStart:${noteId}`, String(el.selectionStart ?? 0));
        localStorage.setItem(`noteCursorEnd:${noteId}`, String(el.selectionEnd ?? 0));
      } catch {}
    };
    el.addEventListener('select', storeSel);
    el.addEventListener('keyup', storeSel);
    el.addEventListener('mouseup', storeSel);
    return () => {
      el.removeEventListener('select', storeSel);
      el.removeEventListener('keyup', storeSel);
      el.removeEventListener('mouseup', storeSel);
    };
  }, [editing, noteId, editContentRef.current]);

  

  const remixMutation = useMutation({
    mutationFn: (p: string) => remixNote(noteId, p),
    onMutate: async (p) => {
      setIsRemixing(true);
      // Measure current content height to size skeleton overlay
      requestAnimationFrame(() => {
        const el = contentRef.current;
        if (el) {
          const h = el.offsetHeight;
          setSkeletonHeight(Math.max(160, h));
        }
      });
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
                    // When leaving, persist focus target so Home can restore
                    sessionStorage.setItem('notesFocus', `note:${note.id}`);
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
            <Input
              ref={editTitleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveEditFocus(1, e.currentTarget);
                  return;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  moveEditFocus(-1, e.currentTarget);
                  return;
                }
                if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
                  e.preventDefault();
                  void onSave();
                }
              }}
            />
          </motion.div>
          <motion.div {...textareaFocus} className="mt-4">
            <Textarea
              ref={editContentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl/Cmd + X => insert Markdown code fences around cursor/selection
                const isCtrlX = (e.ctrlKey || e.metaKey) && (e.code === 'KeyX' || e.key.toLowerCase() === 'x');
                if (isCtrlX) {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const start = el.selectionStart ?? 0;
                  const end = el.selectionEnd ?? start;
                  const before = content.slice(0, start);
                  const selected = content.slice(start, end);
                  const after = content.slice(end);
                  const open = '```javascript\n';
                  const close = '\n```';
                  let nextContent: string;
                  const caretStart = start + open.length;
                  let caretEnd: number;
                  if (start !== end) {
                    // wrap selection
                    nextContent = `${before}${open}${selected}${close}${after}`;
                    caretEnd = caretStart + selected.length;
                  } else {
                    // insert empty fenced block and place caret inside
                    nextContent = `${before}${open}${close}${after}`;
                    caretEnd = caretStart;
                  }
                  setContent(nextContent);
                  // Restore caret inside fences on next paint
                  requestAnimationFrame(() => {
                    try {
                      const node = editContentRef.current;
                      if (node) node.setSelectionRange(caretStart, caretEnd);
                    } catch {}
                  });
                  return;
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveEditFocus(1, e.currentTarget);
                  return;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  moveEditFocus(-1, e.currentTarget);
                  return;
                }
                if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
                  e.preventDefault();
                  void onSave();
                }
              }}
              rows={14}
            />
          </motion.div>
          <div className="mt-3 flex gap-2">
            <motion.div {...buttonHoverTap}>
              <Button
                ref={saveRef}
                onClick={onSave}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveEditFocus(1, e.currentTarget);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveEditFocus(-1, e.currentTarget);
                  }
                }}
              >
                Save
              </Button>
            </motion.div>
            <motion.div {...buttonHoverTap}>
              <Button
                ref={cancelRef}
                variant="ghost"
                onClick={() => setEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveEditFocus(1, e.currentTarget);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveEditFocus(-1, e.currentTarget);
                  }
                }}
              >
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
          <div className="relative mt-2" ref={contentRef}>
            {/* Content cross-fade on update; fades out while remixing */}
            <motion.div
              key={note.updatedAt}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: isRemixing ? 0 : 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Markdown content={note.content} />
            </motion.div>
            {/* Remix skeleton overlay */}
            <AnimatePresence>
              {isRemixing ? (
                <motion.div
                  key="remix-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute left-0 right-0 top-0 rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden pointer-events-none"
                  style={{ height: skeletonHeight || undefined }}
                >
                  <div className="w-full h-full pulse-strong bg-gradient-to-b from-white/20 via-white/10 to-white/20" />
                  {/* Centered spinner */}
                  <motion.div
                    className="absolute inset-0 grid place-items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-black/60 border-t-transparent animate-spin" />
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <motion.div
            className="text-gray-400 mt-4 text-sm"
            animate={{ opacity: isRemixing ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </motion.div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Dropdown open={remixOpen} onOpenChange={setRemixOpen}>
              <DropdownTrigger className="text-sm">
                {isRemixing ? 'Remixing…' : persona ? `Persona: ${persona}` : 'AI remix'}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem
                  onClick={() => {
                    setRemixOpen(false);
                    setPersona('');
                  }}
                >
                  Clear
                </DropdownItem>
                {(personas ?? ['funny', 'corporate', 'silly', 'overfriendly', 'sarcastic', 'summary-scholar']).map((p) => (
                  <DropdownItem
                    key={p}
                    onClick={async () => {
                      setRemixOpen(false);
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
