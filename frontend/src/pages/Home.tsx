import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { pageEnterSlowExit as pageEnter, buttonHoverTap, inputFocus, textareaFocus } from '../config/animations';
import { container } from '../config/styles';
import SearchBar from '../components/SearchBar';
import NotesList from '../components/NotesList';
import useDebounce from '../hooks/useDebounce';
import { createNote, fetchNotes, type NoteListItem } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import TopBar from '../components/TopBar';
import Input from '../components/ui/input';
import Textarea from '../components/ui/textarea';
import Button from '../components/ui/button';
import Modal from '../components/ui/modal';
import Spinner from '../components/ui/spinner';

const Home = () => {
  const [query, setQuery] = useState<string>(() => sessionStorage.getItem('notesQuery') ?? '');
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

  // Query all notes (unfiltered) to determine if the user has any notes at all
  const { data: allNotes } = useQuery<NoteListItem[]>({
    queryKey: ['notes', '__all__'],
    queryFn: () => fetchNotes(''),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const restoreSearchSelection = () => {
    const el = searchRef.current;
    if (!el) return;
    const start = Number(sessionStorage.getItem('notesSearchSelStart') ?? '');
    const end = Number(sessionStorage.getItem('notesSearchSelEnd') ?? '');
    if (Number.isFinite(start) && Number.isFinite(end)) {
      try {
        el.setSelectionRange(start, end);
      } catch {}
    } else {
      // place caret at end
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {}
    }
  };
  const titleRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const createRef = useRef<HTMLButtonElement | null>(null);
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
      setIsNewOpen(false);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const onCreate = async () => {
    await createMutation.mutateAsync();
  };

  // Global shortcuts: Ctrl/Cmd+Space to open Create; Ctrl/Cmd+I to focus Search; Ctrl/Cmd+X to focus first note
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCtrlSpace = (e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ');
      const isCtrlI = (e.ctrlKey || e.metaKey) && (e.code === 'KeyI' || e.key.toLowerCase() === 'i');
      const isCtrlX = (e.ctrlKey || e.metaKey) && (e.code === 'KeyX' || e.key.toLowerCase() === 'x');
      if (isCtrlSpace) {
        e.preventDefault();
        setIsNewOpen(true);
        return;
      }
      if (isCtrlI) {
        e.preventDefault();
        sessionStorage.setItem('notesFocus', 'search');
        requestAnimationFrame(() => {
          searchRef.current?.focus();
          restoreSearchSelection();
        });
        return;
      }
      if (isCtrlX) {
        e.preventDefault();
        const first = document.querySelector<HTMLAnchorElement>('a[data-note-link]');
        if (first) {
          const id = first.getAttribute('data-id') ?? '';
          sessionStorage.setItem('notesFocus', `note:${id}`);
          requestAnimationFrame(() => first.focus());
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus management: on first load, focus search (if there are any notes);
  // restore prior focus from session on return
  useEffect(() => {
    if ((allNotes?.length ?? 0) === 0) return; // hide search if no notes
    const key = sessionStorage.getItem('notesFocus');
    if (!key) {
      // default to search focus on initial load
      requestAnimationFrame(() => {
        searchRef.current?.focus();
        restoreSearchSelection();
      });
      return;
    }
    if (key === 'search') {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
        restoreSearchSelection();
      });
    } else if (key.startsWith('note:')) {
      const id = key.slice('note:'.length);
      const link = document.querySelector<HTMLAnchorElement>(`a[data-note-link][data-id="${CSS.escape(id)}"]`);
      if (link) requestAnimationFrame(() => link.focus());
      else
        requestAnimationFrame(() => {
          searchRef.current?.focus();
          restoreSearchSelection();
        });
    }
  }, [allNotes]);

  // Persist search query and selection in sessionStorage
  useEffect(() => {
    sessionStorage.setItem('notesQuery', query);
  }, [query]);

  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    const storeSel = () => {
      try {
        sessionStorage.setItem('notesSearchSelStart', String(el.selectionStart ?? 0));
        sessionStorage.setItem('notesSearchSelEnd', String(el.selectionEnd ?? 0));
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
  }, [searchRef.current]);

  // Persist scroll position and restore on mount after data renders
  useEffect(() => {
    const onScroll = () => {
      // throttle via rAF
      if ((onScroll as any)._raf) return;
      (onScroll as any)._raf = requestAnimationFrame(() => {
        (onScroll as any)._raf = 0;
        sessionStorage.setItem('notesScrollY', String(window.scrollY));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll as any);
  }, []);

  useEffect(() => {
    // When notes data is available, restore previous scroll position
    if (isLoading) return;
    const y = Number(sessionStorage.getItem('notesScrollY') ?? '');
    if (Number.isFinite(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [isLoading, debounced]);

  // Clear and focus search on Escape when modal is closed
  useEffect(() => {
    if (isNewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setQuery('');
        sessionStorage.setItem('notesQuery', '');
        sessionStorage.setItem('notesSearchSelStart', '0');
        sessionStorage.setItem('notesSearchSelEnd', '0');
        requestAnimationFrame(() => searchRef.current?.focus());
        sessionStorage.setItem('notesFocus', 'search');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isNewOpen]);

  // Close modal with Esc when creating
  useEffect(() => {
    if (!isNewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsNewOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isNewOpen]);

  // Focus Title when opening create modal
  useEffect(() => {
    if (isNewOpen) {
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [isNewOpen]);

  // Helper to cycle focus among modal elements
  const focusOrder = [titleRef, contentRef, createRef, cancelRef] as const;
  const moveFocus = (delta: 1 | -1, current: HTMLElement | null) => {
    const els = focusOrder.map((r) => r.current).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const idx = els.indexOf(current as HTMLElement);
    const next = els[(idx + delta + els.length) % els.length];
    next?.focus();
  };

  return (
    <>
      <TopBar
        left={<div className="text-2xl font-extralight tracking-tight">Notes</div>}
        right={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsNewOpen(true)}>
              New
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        }
      />
      <motion.div
        className={`${container} pt-32 md:pt-36 min-h-[calc(100vh-4rem)] ${!query && !isLoading && (data?.length ?? 0) === 0 ? 'flex flex-col justify-center' : ''}`}
        {...pageEnter}
      >
        {(allNotes?.length ?? 0) > 0 ? (
          <SearchBar
            id="notes-search"
            value={query}
            onChange={setQuery}
            inputRef={searchRef}
            onFocus={() => sessionStorage.setItem('notesFocus', 'search')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const first = document.querySelector<HTMLAnchorElement>('a[data-note-link]');
                if (first) {
                  const id = first.getAttribute('data-id') ?? '';
                  sessionStorage.setItem('notesFocus', `note:${id}`);
                  requestAnimationFrame(() => first.focus());
                }
                return;
              }
              const goToFirst = () => {
                const firstId = (data && data.length > 0 ? data[0].id : allNotes && allNotes.length > 0 ? allNotes[0].id : null);
                if (firstId != null) {
                  sessionStorage.setItem('notesFocus', `note:${firstId}`);
                  navigate(`/notes/${firstId}`);
                }
              };
              if (e.key === 'ArrowRight' || e.code === 'ArrowRight') {
                e.preventDefault();
                goToFirst();
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                goToFirst();
              }
            }}
          />
        ) : null}
        {isLoading && !(data && data.length > 0) && (
          <div className="mt-2 text-gray-400">
            <div className="inline-flex items-center gap-2">
              <Spinner size="sm" center={false} />
              <span>Loading…</span>
            </div>
          </div>
        )}
        {error && <div className="mt-3 text-red-400">{error}</div>}
        <div className="mt-6">
          {data && data.length > 0 ? (
            <NotesList notes={data} />
          ) : (
            !query && (
              <div className="text-center text-gray-400 py-16">No notes yet. Create your first note below.</div>
            )
          )}
        </div>

        {/* New Note Modal */}
        <Modal open={isNewOpen} onOpenChange={setIsNewOpen} title="New Note">
          <div>
            <motion.div {...inputFocus}>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  const isCtrlSpace = (e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ');
                  const isEnter = e.key === 'Enter' && !e.shiftKey;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveFocus(1, e.currentTarget);
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveFocus(-1, e.currentTarget);
                    return;
                  }
                  if ((isCtrlSpace || isEnter) && canCreate) {
                    e.preventDefault();
                    void onCreate();
                  }
                }}
                placeholder="Title"
              />
            </motion.div>
            <motion.div {...textareaFocus} className="mt-4">
              <Textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveFocus(1, e.currentTarget);
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveFocus(-1, e.currentTarget);
                    return;
                  }
                  if ((e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ')) {
                    e.preventDefault();
                    if (canCreate) onCreate();
                  }
                }}
                placeholder="Content"
                rows={8}
              />
            </motion.div>
            <div className="mt-4 flex items-center gap-3 justify-end">
              <Button
                ref={cancelRef}
                variant="ghost"
                onClick={() => setIsNewOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveFocus(1, e.currentTarget);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveFocus(-1, e.currentTarget);
                  }
                }}
              >
                Cancel
              </Button>
              <motion.div {...(canCreate ? buttonHoverTap : {})}>
                <Button
                  ref={createRef}
                  disabled={!canCreate}
                  onClick={onCreate}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      moveFocus(1, e.currentTarget);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      moveFocus(-1, e.currentTarget);
                    }
                  }}
                >
                  Create
                </Button>
              </motion.div>
            </div>
          </div>
        </Modal>
      </motion.div>
    </>
  );
};

export default Home;
