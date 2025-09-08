import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { z } from 'zod';
import { requirePassword } from './auth';
import { createNote, deleteNote, getNote, listNotes, searchNotes, updateNote } from './notes';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Simple auth check endpoint; requires correct X-Password header
app.get('/api/auth', requirePassword, (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/notes', (req, res) => {
  const q = (req.query.q as string | undefined) || '';
  const notes = q.trim() ? searchNotes(q.trim()) : listNotes();
  // Send lightweight list payload with excerpt
  const items = notes.map((n) => ({
    id: n.id,
    title: n.title,
    excerpt: n.content.length > 160 ? n.content.slice(0, 160) + '…' : n.content,
    updatedAt: n.updatedAt,
  }));
  res.json(items);
});

app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const note = getNote(id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

const NoteSchema = z.object({ title: z.string().min(1), content: z.string().default('') });

app.post('/api/notes', requirePassword, (req, res) => {
  const parse = NoteSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
  const note = createNote(parse.data);
  res.status(201).json(note);
});

app.put('/api/notes/:id', requirePassword, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const parse = NoteSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
  const note = updateNote(id, parse.data);
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

app.delete('/api/notes/:id', requirePassword, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const ok = deleteNote(id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
