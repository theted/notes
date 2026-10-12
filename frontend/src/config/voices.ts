// The remix personas (backend/src/personas), plus the plain original: each with the splash
// headline in its voice, and the glow that tints the page while it's the active voice
export type Voice = {
  id: string;
  label: string;
  lines: readonly [string, string];
  glow: string;
};

export const VOICES: readonly Voice[] = [
  {
    id: 'plain',
    label: 'Plain',
    lines: ['Write it down.', 'Find it in a keystroke.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(99,102,241,0.2),transparent)]',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    lines: ['Capture the insight.', 'Retrieve it at scale.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(56,130,200,0.2),transparent)]',
  },
  {
    id: 'funny',
    label: 'Funny',
    lines: ['Write it down.', 'Future you says thanks.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(245,158,11,0.14),transparent)]',
  },
  {
    id: 'overfriendly',
    label: 'Overfriendly',
    lines: ['Jot it down, friend!', "We'll find it together!"],
    glow: 'bg-[radial-gradient(closest-side,rgba(244,114,182,0.16),transparent)]',
  },
  {
    id: 'sarcastic',
    label: 'Sarcastic',
    lines: ['Write it down.', 'Or just remember. Sure.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(139,92,246,0.2),transparent)]',
  },
  {
    id: 'silly',
    label: 'Silly',
    lines: ['Scribble it down.', 'Boop. Ta-da, found it!'],
    glow: 'bg-[radial-gradient(closest-side,rgba(163,230,53,0.12),transparent)]',
  },
  {
    id: 'summary-scholar',
    label: 'Summary scholar',
    lines: ['In summary:', 'write once, find fast.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(45,212,191,0.16),transparent)]',
  },
];

export const PLAIN = VOICES[0];

// A persona the backend knows but this list doesn't still gets a chip, in the plain tint
export const voiceFor = (id: string): Voice =>
  VOICES.find((v) => v.id === id) ?? {
    ...PLAIN,
    id,
    label: `${id.charAt(0).toUpperCase()}${id.slice(1).replace(/-/g, ' ')}`,
  };
