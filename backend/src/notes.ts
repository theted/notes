import { db } from './db';
import type { Note, NoteInput } from './types';

type NoteRow = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const rowToNote = (row: NoteRow): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getNote = (id: number): Note | null => {
  const row = db.prepare<NoteRow>('SELECT * FROM notes WHERE id = ?').get(id);
  return row ? rowToNote(row) : null;
};

export const listNotes = (): Note[] => {
  const rows = db.prepare<NoteRow>('SELECT * FROM notes ORDER BY updated_at DESC').all();
  return rows.map(rowToNote);
};

export const createNote = (input: NoteInput): Note => {
  const stmt = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
  const info = stmt.run(input.title, input.content);
  const row = db
    .prepare<NoteRow>('SELECT * FROM notes WHERE id = ?')
    .get(info.lastInsertRowid as number)!;
  return rowToNote(row);
};

export const updateNote = (id: number, input: NoteInput): Note | null => {
  const stmt = db.prepare('UPDATE notes SET title = ?, content = ? WHERE id = ?');
  const result = stmt.run(input.title, input.content, id);
  if (result.changes === 0) return null;
  const row = db.prepare<NoteRow>('SELECT * FROM notes WHERE id = ?').get(id)!;
  return rowToNote(row);
};

export const deleteNote = (id: number): boolean => {
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  return result.changes > 0;
};

// Simple fuzzy subsequence matcher with basic scoring
const fuzzyScore = (query: string, text: string): number => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;

  // Exact/substring bonuses
  let score = 0;
  const idx = t.indexOf(q);
  if (idx >= 0) {
    score += 100 - Math.min(idx, 90);
  }

  // Subsequence pass
  let ti = 0;
  let run = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found === -1) return -Infinity; // not a subsequence
    run = found === ti ? run + 2 : 0;
    score += 5 + Math.max(0, 3 - (found - ti));
    ti = found + 1;
  }
  score += run; // contiguous bonus
  return score;
};

export const searchNotes = (query: string): Note[] => {
  const rows = db.prepare<NoteRow>('SELECT * FROM notes').all();
  type Scored = { row: NoteRow; score: number };
  const scored: Scored[] = rows
    .map((r) => {
      const titleScore = fuzzyScore(query, r.title);
      const contentScore = fuzzyScore(query, r.content) * 0.5; // weight content lower
      return { row: r, score: titleScore + contentScore };
    })
    .filter((s) => s.score > -Infinity)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => rowToNote(s.row));
};
