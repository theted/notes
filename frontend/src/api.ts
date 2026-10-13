const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';

const withPassword = (headers?: HeadersInit): HeadersInit => {
  const pwd = localStorage.getItem('password') ?? '';
  return { ...(headers ?? {}), 'X-Password': pwd };
};

export type NoteListItem = { id: number; title: string; excerpt: string; updatedAt: string };
export type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const fetchNotes = async (q: string): Promise<NoteListItem[]> => {
  const url = new URL(BASE + '/notes', window.location.origin);
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url.toString(), { headers: withPassword() });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
};

export const fetchNote = async (id: number): Promise<Note> => {
  const res = await fetch(`${BASE}/notes/${id}`, { headers: withPassword() });
  if (!res.ok) throw new Error('Not found');
  return res.json();
};

export const createNote = async (title: string, content: string): Promise<Note> => {
  const res = await fetch(`${BASE}/notes`, {
    method: 'POST',
    headers: withPassword({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json();
};

export const updateNote = async (id: number, title: string, content: string): Promise<Note> => {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: 'PUT',
    headers: withPassword({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
};

export const deleteNote = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/notes/${id}`, { method: 'DELETE', headers: withPassword() });
  if (!res.ok) throw new Error('Delete failed');
};

// Thrown when today's remixes are used up; the message says when they come back
export class RemixLimitError extends Error {}

// `remaining`: remixes left today for this notebook and connection, whichever is lower
export type RemixResult = { note: Note; remaining: number | null };

export const remixNote = async (id: number, persona: string): Promise<RemixResult> => {
  const res = await fetch(`${BASE}/notes/${id}/remix`, {
    method: 'POST',
    headers: withPassword({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ persona }),
  });
  if (res.status === 429) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new RemixLimitError(body.message ?? "You've used today's remixes. Try again tomorrow.");
  }
  if (!res.ok) throw new Error('Remix failed');
  const remaining = res.headers.get('X-RateLimit-Remaining');
  return { note: await res.json(), remaining: remaining == null ? null : Number(remaining) };
};

export const fetchPersonas = async (): Promise<string[]> => {
  const res = await fetch(`${BASE}/personas`);
  if (!res.ok) throw new Error('Failed to fetch personas');
  return res.json();
};
