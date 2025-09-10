import type { Note, NoteInput } from './types';
import { NoteModel } from './orm';

const rowToNote = (row: NoteModel): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getNote = async (id: number, userId: number): Promise<Note | null> => {
  const row = await NoteModel.findOne({ where: { id, user_id: userId } });
  return row ? rowToNote(row) : null;
};

export const listNotes = async (userId: number): Promise<Note[]> => {
  const rows = await NoteModel.findAll({ where: { user_id: userId }, order: [['updated_at', 'DESC']] });
  return rows.map(rowToNote);
};

export const createNote = async (input: NoteInput, userId: number): Promise<Note> => {
  const row = await NoteModel.create({ title: input.title, content: input.content, user_id: userId });
  return rowToNote(row);
};

export const updateNote = async (id: number, input: NoteInput, userId: number): Promise<Note | null> => {
  const row = await NoteModel.findOne({ where: { id, user_id: userId } });
  if (!row) return null;
  row.title = input.title;
  row.content = input.content;
  await row.save();
  return rowToNote(row);
};

export const deleteNote = async (id: number, userId: number): Promise<boolean> => {
  const result = await NoteModel.destroy({ where: { id, user_id: userId } });
  return result > 0;
};

// Simple fuzzy subsequence matcher with basic scoring (case-insensitive)
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

// Loose fallback scorer: token-based substring hits (case-insensitive)
const looseScore = (query: string, title: string, content: string): number => {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;
  const tTitle = title.toLowerCase();
  const tContent = content.toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (tTitle.includes(tok)) score += 20; // strong weight to title hits
    if (tContent.includes(tok)) score += 8;
  }
  // small bonus if full query appears in title/content
  if (tTitle.includes(q)) score += 25;
  if (tContent.includes(q)) score += 10;
  return score;
};

export const searchNotes = async (query: string, userId: number): Promise<Note[]> => {
  const rows = await NoteModel.findAll({ where: { user_id: userId } });
  type Scored = { row: NoteModel; score: number };

  // Primary pass: subsequence match on title and content
  const primary: Scored[] = rows
    .map((r: NoteRow) => {
      const titleScore = fuzzyScore(query, r.title);
      const contentScore = fuzzyScore(query, r.content) * 0.5; // weight content lower
      return { row: r, score: titleScore + contentScore };
    })
    .filter((s: Scored) => s.score > -Infinity)
    .sort((a: Scored, b: Scored) => b.score - a.score);

  // If enough matches or empty query, return primary
  if (primary.length >= 3 || query.trim().length === 0) {
    return primary.map((s) => rowToNote(s.row));
  }

  // Fallback pass: looser token-based substring scoring to surface near matches
  const inPrimary = new Set(primary.map((s) => s.row.id));
  const fallback: Scored[] = rows
    .filter((r: NoteRow) => !inPrimary.has(r.id))
    .map((r: NoteRow) => ({ row: r, score: looseScore(query, r.title, r.content) }))
    .filter((s: Scored) => s.score > 0)
    .sort((a: Scored, b: Scored) => b.score - a.score)
    .slice(0, 10);

  const combined = [...primary, ...fallback];
  return combined.map((s) => rowToNote(s.row));
};
