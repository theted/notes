import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { z } from 'zod';
import { requirePassword } from './auth';
import { createNote, deleteNote, getNote, listNotes, searchNotes, updateNote } from './notes';
import { remixContent, listPersonas, probeOpenAI } from './ai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth handshake: returns or creates user from password
app.get('/api/auth', requirePassword, (req, res) => {
  const userId = (req as any).userId as number;
  res.json({ ok: true, userId });
});

app.get('/api/notes', requirePassword, (req, res) => {
  const userId = (req as any).userId as number;
  const q = (req.query.q as string | undefined) || '';
  const notes = q.trim() ? searchNotes(q.trim(), userId) : listNotes(userId);
  // Send lightweight list payload with excerpt
  const toExcerpt = (md: string): string => {
    if (!md) return '';
    let src = md;
    // Strip raw HTML blocks for safety
    src = src.replace(/<[^>]+>/g, '');
    // Convert images to alt text
    src = src.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1');
    // Links: keep text
    src = src.replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1');

    // Identify fenced code blocks
    type Block = { type: 'code' | 'text'; content: string; lang?: string };
    const blocks: Block[] = [];
    const fenceRe = /```([\w-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = fenceRe.exec(src))) {
      const [full, lang, body] = match;
      if (match.index > lastIndex) {
        blocks.push({ type: 'text', content: src.slice(lastIndex, match.index) });
      }
      blocks.push({ type: 'code', content: body, lang: lang || undefined });
      lastIndex = match.index + full.length;
    }
    if (lastIndex < src.length) {
      blocks.push({ type: 'text', content: src.slice(lastIndex) });
    }

    // Build excerpt paragraphs while allowing an early/short code block
    const paras: string[] = [];
    const MAX_PARAS = 15;
    const ALLOW_CODE_WITHIN_PARAS = 6; // allow keeping a code block if it appears within the first N paragraphs
    const MAX_CODE_LINES = 80; // skip overly long code blocks
    let paraCount = 0;
    let seenCode = false;

    const pushText = (t: string) => {
      const chunks = t
        .split(/\n{2,}/) // paragraphs by blank lines
        .map((s) => s.trim())
        .filter(Boolean);
      for (const chunk of chunks) {
        // soft-trim overly long list of bullets/numbers: keep first 20 lines
        const lines = chunk.split(/\n/);
        const trimmed = lines.length > 20 ? lines.slice(0, 20).join('\n') + '\n…' : chunk;
        paras.push(trimmed);
        paraCount++;
        if (paraCount >= MAX_PARAS) return true;
      }
      return false;
    };

    for (const b of blocks) {
      if (paraCount >= MAX_PARAS) break;
      if (b.type === 'text') {
        if (pushText(b.content)) break;
      } else if (b.type === 'code') {
        const codeLines = b.content.replace(/\s+$/,'').split(/\n/);
        const shortEnough = codeLines.length <= MAX_CODE_LINES;
        const earlyEnough = paraCount <= ALLOW_CODE_WITHIN_PARAS;
        if (!seenCode && shortEnough && earlyEnough) {
          seenCode = true;
          paras.push(['```' + (b.lang || ''), ...codeLines, '```'].join('\n'));
          paraCount++;
        } else {
          // skip or replace with ellipsis if it's early but too long
          if (!seenCode && earlyEnough) {
            paras.push('`…code omitted…`');
            paraCount++;
          }
        }
      }
    }

    const excerptMd = paras.join('\n\n').trim();
    // As a guard, cap total characters
    const MAX_CHARS = 4000;
    return excerptMd.length > MAX_CHARS ? excerptMd.slice(0, MAX_CHARS).trimEnd() + '…' : excerptMd;
  };
  const items = notes.map((n) => ({
    id: n.id,
    title: n.title,
    excerpt: toExcerpt(n.content),
    updatedAt: n.updatedAt,
  }));
  res.json(items);
});

app.get('/api/notes/:id', requirePassword, (req, res) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const note = getNote(id, userId);
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

// List personas for UI convenience
app.get('/api/personas', (_req, res) => {
  res.json(listPersonas());
});

// AI connectivity health check (calls OpenAI). Protected to avoid abuse.
app.get('/api/ai/health', requirePassword, async (_req, res) => {
  const result = await probeOpenAI();
  if (result.ok) return res.json(result);
  return res.status(500).json(result);
});

const NoteSchema = z.object({ title: z.string().min(1), content: z.string().default('') });

app.post('/api/notes', requirePassword, (req, res) => {
  const userId = (req as any).userId as number;
  const parse = NoteSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
  const note = createNote(parse.data, userId);
  res.status(201).json(note);
});

app.put('/api/notes/:id', requirePassword, (req, res) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const parse = NoteSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
  const note = updateNote(id, parse.data, userId);
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

app.delete('/api/notes/:id', requirePassword, (req, res) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const ok = deleteNote(id, userId);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// AI Remix endpoint
app.post('/api/notes/:id/remix', requirePassword, async (req, res) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const Schema = z.object({ persona: z.string().min(1) });
  const parse = Schema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: 'Invalid payload', details: parse.error.flatten() });
  const current = getNote(id, userId);
  if (!current) return res.status(404).json({ error: 'Not found' });
  try {
    const remixed = await remixContent(current.content, parse.data.persona);
    const updated = updateNote(id, { title: current.title, content: remixed }, userId);
    if (!updated) return res.status(500).json({ error: 'Failed to update' });
    res.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: 'Remix failed', details: message });
  }
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
  // Optional: probe OpenAI once on startup (non-fatal)
  if (process.env.AI_STARTUP_CHECK && process.env.OPENAI_API_KEY) {
    try {
      const result = await probeOpenAI();
      if (result.ok) {
        console.log(`OpenAI ready. Model: ${result.model}`);
      } else {
        console.warn(`OpenAI probe failed: ${result.error}`);
      }
    } catch (e) {
      console.warn('OpenAI probe crashed:', e instanceof Error ? e.message : String(e));
    }
  }
});
