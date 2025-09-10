// Centralized configuration and literals for AI-related features

// Model selection
export const DEFAULT_MODEL_CANDIDATES = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4.1-mini',
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
export const BASE_PROMPT = `You are an expert text stylist. Your job is to rewrite a user's note by changing the TONE only, according to a given persona, while preserving:
- Overall meaning and intent
- High-level structure and section order
- Formatting and markup (especially Markdown headings, lists, code blocks)
- Original language
- Code inside code blocks (comments may be translated)
Only output the rewritten content, without any extra commentary.`;

export const REMIX_USER_INSTRUCTION =
  "Rewrite the following note content in the persona's tone while keeping the structure and formatting.";

export const PROBE_SYSTEM_PROMPT = 'You are concise.';
export const PROBE_USER_PROMPT = 'Reply with exactly: OK';
export const PROBE_OK_PATTERN = /\bok\b/i;
