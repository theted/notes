import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import {
  DEFAULT_MODEL_CANDIDATES,
  REMIX_TEMPERATURE,
  PROBE_TEMPERATURE,
  PROBE_MAX_TOKENS,
  PROBE_SYSTEM_PROMPT,
  PROBE_USER_PROMPT,
  PROBE_OK_PATTERN,
  REMIX_USER_INSTRUCTION,
  BASE_PROMPT,
} from './constants';

// Derived paths and caches
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
  const fromEnv = process.env['OPENAI_MODEL']?.trim();
  const base = [...(fromEnv ? [fromEnv] : []), ...DEFAULT_MODEL_CANDIDATES];
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

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

// Shared wrapper for chat.completions.create
const runChatCompletion = (
  client: OpenAI,
  model: string,
  messages: Message[],
  options?: { temperature?: number; maxTokens?: number },
) => {
  const payload: any = {
    model,
    messages,
  };
  if (options?.temperature != null) payload.temperature = options.temperature;
  if (options?.maxTokens != null) payload.max_tokens = options.maxTokens;
  return client.chat.completions.create(payload);
};

const buildRemixMessages = (personaPrompt: string, content: string): Message[] => [
  { role: 'system', content: BASE_PROMPT },
  { role: 'system', content: personaPrompt },
  {
    role: 'user',
    content: `${REMIX_USER_INSTRUCTION}\n\n---\n${content}`,
  },
];

export const remixContent = async (content: string, persona: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error(`OPENAI_API_KEY is not configured`);
  const prompt = loadPersona(persona);
  if (!prompt) throw new Error('Persona not found');

  const client = new OpenAI({ apiKey });

  const errors: string[] = [];
  // Try cached working model first
  if (cachedModel) {
    try {
      const res = await runChatCompletion(
        client,
        cachedModel,
        buildRemixMessages(prompt, content),
        { temperature: REMIX_TEMPERATURE },
      );
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
      const res = await runChatCompletion(client, model, buildRemixMessages(prompt, content), {
        temperature: REMIX_TEMPERATURE,
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
  if (!apiKey) return { ok: false, error: `Missing OPENAI_API_KEY` };
  const client = new OpenAI({ apiKey });
  const errors: string[] = [];
  for (const model of getModelCandidates()) {
    try {
      const res = await runChatCompletion(
        client,
        model,
        [
          { role: 'system', content: BASE_PROMPT },
          { role: 'system', content: PROBE_SYSTEM_PROMPT },
          { role: 'user', content: PROBE_USER_PROMPT },
        ],
        { temperature: PROBE_TEMPERATURE, maxTokens: PROBE_MAX_TOKENS },
      );
      const text = res.choices?.[0]?.message?.content ?? '';
      if (PROBE_OK_PATTERN.test(text)) {
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
