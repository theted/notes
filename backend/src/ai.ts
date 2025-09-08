import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

const personasDir = path.resolve(process.cwd(), 'src', 'personas');
let cachedModel: string | null = null;

// Remove accidental leading or trailing '---' separators and surrounding whitespace/BOM
const cleanRemix = (s: string): string => {
  return s
    .replace(/^(?:\uFEFF)?\s*---\s*\n?/, '') // strip leading '---' line
    .replace(/\n?\s*---\s*$/, '') // strip trailing '---' line
    .trim();
};

const getModelCandidates = (): string[] => {
  const fromEnv = process.env.OPENAI_MODEL?.trim();
  const base = [
    // Put env override first if provided
    ...(fromEnv ? [fromEnv] : []),
    // Preferred defaults (ordered)
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4.1-mini',
    'gpt-4.1',

    // gpt-5
    // gpt-5-mini
    // gpt-5-nano
    // gpt-4.1
    // gpt-4.1-mini
    // gpt-4.1-nano
    // o3
    // o4-mini
    // gpt-4o
    // gpt-4o-realtime-preview
  ];
  // Deduplicate while preserving order
  return Array.from(new Set(base));
};

export const listPersonas = (): string[] => {
  try {
    return fs
      .readdirSync(personasDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => path.basename(f, '.md'))
      .sort();
  } catch {
    return [];
  }
};

export const loadPersona = (name: string): string | null => {
  const file = path.join(personasDir, `${name}.md`);
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
};

const basePrompt = `You are an expert text stylist. Your job is to rewrite a user's note by changing the TONE only, according to a given persona, while preserving:
- Overall meaning and intent
- High-level structure and section order
- Formatting and markup (especially Markdown headings, lists, code blocks)
- Original language
- Code inside code blocks (comments may be translated)
Only output the rewritten content, without any extra commentary.`;

export const remixContent = async (content: string, persona: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  const prompt = loadPersona(persona);
  if (!prompt) throw new Error('Persona not found');

  const client = new OpenAI({ apiKey });

  const errors: string[] = [];
  // Try cached working model first
  if (cachedModel) {
    try {
      const res = await client.chat.completions.create({
        model: cachedModel,
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `Rewrite the following note content in the persona's tone while keeping the structure and formatting.\n\n---\n${content}`,
          },
        ],
        temperature: 0.7,
      });
      const text = res.choices?.[0]?.message?.content ?? '';
      if (text) {
        const cleaned = cleanRemix(text);
        return cleaned;
      }
      errors.push(`Cached model ${cachedModel} returned empty content.`);
    } catch (e) {
      errors.push(
        `Cached model ${cachedModel} failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      cachedModel = null; // drop cache and continue
    }
  }
  for (const model of getModelCandidates()) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `Rewrite the following note content in the persona's tone while keeping the structure and formatting.\n\n---\n${content}`,
          },
        ],
        temperature: 0.7,
      });
      const text = res.choices?.[0]?.message?.content ?? '';
      if (text) {
        cachedModel = model; // remember working model
        const cleaned = cleanRemix(text);
        return cleaned;
      }
      errors.push(`Model ${model} returned empty content.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Model ${model} failed: ${msg}`);
      continue;
    }
  }
  throw new Error(
    `All models failed. Tried: ${getModelCandidates().join(', ')}. Details: ${errors.join(' | ')}`,
  );
};

export const probeOpenAI = async (): Promise<{
  ok: boolean;
  model?: string;
  sample?: string;
  error?: string;
}> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing OPENAI_API_KEY' };
  const client = new OpenAI({ apiKey });
  const errors: string[] = [];
  for (const model of getModelCandidates()) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: basePrompt },
          { role: 'system', content: 'You are concise.' },
          { role: 'user', content: 'Reply with exactly: OK' },
        ],
        temperature: 0,
        max_tokens: 5,
      });
      const text = res.choices?.[0]?.message?.content ?? '';
      if (/\bok\b/i.test(text)) {
        cachedModel = model;
        return { ok: true, model, sample: text };
      }
      errors.push(`Model ${model} unexpected output: ${text}`);
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { ok: false, error: errors.join(' | ') };
};
