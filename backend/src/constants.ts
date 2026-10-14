// Centralized configuration and literals for AI-related features

// Model selection
export const DEFAULT_MODEL_CANDIDATES = [
  // Holds a persona's voice far better than gpt-4o-mini (compared 2026-10-15), for pennies more
  'gpt-4.1-mini',
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4.1',
  // gpt-5
  // gpt-5-mini
  // gpt-5-nano
  // gpt-4.1
  // gpt-4.1-nano
  // o3
  // o4-mini
  // gpt-4o
] as const;

// Temperatures and token limits
export const REMIX_TEMPERATURE = 0.7;
export const PROBE_TEMPERATURE = 0;
export const PROBE_MAX_TOKENS = 5;

// Prompts
export const BASE_PROMPT = `You are an expert text stylist. Rewrite the user's note in the voice of the given persona.
Commit to the voice: a reader should recognise the persona in every sentence, even in a two-line note. Rewording, reshaping sentences and short in-character asides are all welcome. Preserve:
- The facts: every task, name, date and number, so the note stays useful
- High-level structure and section order
- Formatting and markup (especially Markdown headings, lists, code blocks)
- Original language
- Code inside code blocks (comments may be translated)
Don't add headings, titles, lists or sections the note doesn't already have.
The note may already be in another voice from an earlier rewrite. Discard that voice completely, including its emojis, exclamations and pet phrases, and start again from the plain facts.
Only output the rewritten content, without any extra commentary.`;

export const REMIX_USER_INSTRUCTION =
  "Rewrite the note below in the persona's voice. Start from its plain facts, ignoring whatever voice it's written in now, and keep its structure and formatting.";

export const PROBE_SYSTEM_PROMPT = 'You are concise.';
export const PROBE_USER_PROMPT = 'Reply with exactly: OK';
export const PROBE_OK_PATTERN = /\bok\b/i;
