import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteNote,
  fetchNote,
  updateNote,
  remixNote,
  fetchPersonas,
  RemixLimitError,
  type Note,
} from '../api';
import type { NoteListItem } from '../api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  enterItem,
  remixLine,
  contentSwap,
  buttonHoverTap,
  inputFocus,
  textareaFocus,
} from '../config/animations';
import { column, pageHeadline, sweep } from '../config/styles';
import { PLAIN, VOICES, voiceFor } from '../config/voices';
import { cn } from '../lib/utils';
import Page from '../components/Page';
import BlurWords from '../components/BlurWords';
import VoiceGlow from '../components/VoiceGlow';
import VoiceChips from '../components/VoiceChips';
import { useAuth } from '../auth/AuthContext';
import TopBar from '../components/TopBar';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Button from '../components/ui/button';
import Markdown from '../components/Markdown';
import Spinner from '../components/ui/spinner';
import { useToast } from '../components/ui/toast';

// "Original" puts back the note as it was before this visit's remixes
const ORIGINAL = { ...PLAIN, label: 'Original' };
const DEFAULT_PERSONAS = VOICES.slice(1).map((v) => v.id);
// Remixes left today at which a remix starts mentioning the count
const REMIX_LOW = 5;

const NoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const noteId = Number(id);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState(PLAIN.id);
  const [error] = useState<string | null>(null);
  const { logout } = useAuth();
  const editTitleRef = useRef<HTMLInputElement | null>(null);
  const editContentRef = useRef<HTMLTextAreaElement | null>(null);
  const saveRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    data: note,
    isFetching,
    isLoading,
  } = useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: () => fetchNote(noteId),
    placeholderData: keepPreviousData,
  });
  const { data: personas } = useQuery<string[]>({
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
        queryClient.setQueryData<NoteListItem[]>(
          key as unknown as readonly [string, string],
          list.filter((n) => n.id !== noteId),
        );
      });
      // Clear note cache
      queryClient.removeQueries({ queryKey: ['note', noteId] });
      return { prevNote, prevLists } as const;
    },
    onError: (_e, _v, ctx) => {
      // Rollback
      if (ctx?.prevNote) queryClient.setQueryData(['note', noteId], ctx.prevNote);
      ctx?.prevLists.forEach(([key, list]) =>
        queryClient.setQueryData<NoteListItem[]>(key as unknown as readonly [string, string], list),
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
      const isCtrlX =
        (e.ctrlKey || e.metaKey) && (e.code === 'KeyX' || e.key.toLowerCase() === 'x');
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
    onMutate: () => ({ before: note?.content ?? '' }),
    onSuccess: ({ note: n, remaining }, _p, ctx) => {
      setOriginalContent((prev) => prev ?? ctx?.before ?? null);
      queryClient.setQueryData(['note', noteId], n);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      // Only speak up when the daily allowance is nearly gone
      if (remaining != null && remaining <= REMIX_LOW)
        toast.show({
          title:
            remaining === 0
              ? 'That was the last remix for today'
              : `${remaining} ${remaining === 1 ? 'remix' : 'remixes'} left today`,
          description: 'The limit resets at midnight UTC.',
          duration: 4000,
        });
    },
    onError: (e) => {
      if (e instanceof RemixLimitError)
        toast.show({ title: 'No remixes left today', description: e.message, duration: 6000 });
      else
        toast.show({
          title: "Couldn't remix this note",
          description: "The AI service didn't answer. Try again in a moment.",
          duration: 4000,
        });
    },
  });
  const isRemixing = remixMutation.isPending;

  const onUndo = async () => {
    if (originalContent == null || !note) return;
    // restore on server and cache
    const restored = await updateNote(noteId, note.title, originalContent);
    queryClient.setQueryData(['note', noteId], restored);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    setOriginalContent(null);
  };

  const pickVoice = (id: string) => {
    if (id === voiceId) return;
    const prev = voiceId;
    setVoiceId(id);
    if (id === PLAIN.id)
      onUndo().catch(() => {
        setVoiceId(prev);
        alert("Couldn't restore the original.");
      });
    else remixMutation.mutate(id, { onError: () => setVoiceId(prev) });
  };

  const voice = voiceFor(voiceId);
  const voices = [ORIGINAL, ...(personas ?? DEFAULT_PERSONAS).map(voiceFor)];

  if (error) return <div className="p-6">Error: {error}</div>;
  if (!note && (isLoading || isFetching)) return <Spinner size="md" />;
  if (!note) return <div className="p-6">Not found</div>;

  return (
    <>
      <TopBar
        left={
          <Link to="/" className="text-gray-300 hover:text-white transition">
            ← Back
          </Link>
        }
        right={
          <>
            {!editing && (
              <motion.div {...buttonHoverTap}>
                <Button
                  variant="ghost"
                  size="sm"
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
              <Button variant="destructive" size="sm" onClick={onDelete}>
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
      <Page className="relative min-h-screen overflow-hidden">
        <VoiceGlow voice={voice} busy={isRemixing} />
        <div className={`${column} relative pt-28 md:pt-32 pb-24`}>
          {editing ? (
            <motion.div key="edit" {...enterItem}>
              <motion.div {...inputFocus}>
                <Input
                  ref={editTitleRef}
                  aria-label="Title"
                  className="h-14 !text-2xl font-extralight"
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
                    const isCtrlX =
                      (e.ctrlKey || e.metaKey) &&
                      (e.code === 'KeyX' || e.key.toLowerCase() === 'x');
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
            <React.Fragment key="view">
              <motion.h1 className={pageHeadline} variants={remixLine}>
                <BlurWords text={note.title} />
              </motion.h1>
              <motion.p className="mt-3 text-sm text-gray-400" aria-live="polite" {...enterItem}>
                {isRemixing
                  ? `Remixing as ${voice.label}…`
                  : `Updated ${new Date(note.updatedAt).toLocaleString()}`}
              </motion.p>
              <motion.div className="mt-6" {...enterItem}>
                <VoiceChips
                  voices={voices}
                  activeId={voice.id}
                  onPick={pickVoice}
                  disabled={isRemixing}
                  indicator={isRemixing && <span className={cn(sweep, 'via-white/25')} />}
                />
              </motion.div>
              <motion.div className="relative" {...enterItem}>
                {/* Each saved version blurs in; while a remix cooks, the current one dims under a sweep */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={note.updatedAt}
                    variants={contentSwap}
                    initial="hidden"
                    animate={isRemixing ? 'busy' : 'show'}
                    exit="leave"
                  >
                    <Markdown content={note.content} />
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  {isRemixing && (
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className={cn(sweep, 'via-white/[0.07]')} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </React.Fragment>
          )}
        </div>
      </Page>
    </>
  );
};

export default NoteDetail;
