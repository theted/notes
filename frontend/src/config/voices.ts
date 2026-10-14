// The remix personas (backend/src/personas), plus the plain original: each with the splash
// headline in its voice, the glow that tints the page while it's the active voice, and the
// splash's demo note as that persona actually rewrote it
export type Voice = {
  id: string;
  label: string;
  lines: readonly [string, string];
  glow: string;
  sample: string;
};

export const VOICES: readonly Voice[] = [
  {
    id: 'plain',
    label: 'Plain',
    lines: ['Write it down.', 'Find it in a keystroke.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(99,102,241,0.2),transparent)]',
    sample: 'Water the monstera on Friday.\n\nRepot the basil when the roots show.',
  },
  {
    id: 'bard',
    label: 'Bard',
    lines: ['Set down thy thoughts,', 'and find them anon.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(217,70,239,0.15),transparent)]',
    sample:
      'Upon the coming of Friday, thou shalt bestow water unto the monstera, that it may flourish.\n\nAnd when the roots of the basil doth appear, repot it forthwith.',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    lines: ['Capture the insight.', 'Retrieve it at scale.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(56,130,200,0.2),transparent)]',
    sample:
      'Action item: water the monstera by Friday.\n\nTask: repot the basil once root growth is visible.',
  },
  {
    id: 'funny',
    label: 'Funny',
    lines: ['Write it down.', 'Future you says thanks.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(245,158,11,0.14),transparent)]',
    sample:
      "Friday: give the monstera its weekly spa treatment, aka water.\n\nBasil's roots getting crowded? Upgrade its digs before it starts sending eviction notices.",
  },
  {
    id: 'noir',
    label: 'Noir',
    lines: ['The note was short.', 'The search, shorter.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(203,213,225,0.11),transparent)]',
    sample:
      "Friday. The monstera needed a drink. No use waiting for rain in this town.\n\nThe basil's roots would tell the story. When they peeked out, I'd move it to a new home.",
  },
  {
    id: 'overfriendly',
    label: 'Overfriendly',
    lines: ['Jot it down, friend!', "We'll find it together!"],
    glow: 'bg-[radial-gradient(closest-side,rgba(244,114,182,0.16),transparent)]',
    sample:
      "Hey you! Just a little reminder to give the monstera some water on Friday. It'll be so happy!\n\nAnd when the basil's roots peek out, it's time for a cozy new pot. You've got this! 🌿",
  },
  {
    id: 'pirate',
    label: 'Pirate',
    lines: ['Ink it down, matey.', 'Find yer treasure fast.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(6,182,212,0.16),transparent)]',
    sample:
      "Arr, come Friday, ye'll be waterin' the monstera, lest she wither like a ship in a drought.\n\nWhen the basil's roots be pokin' out, it's time to repot her, savvy?",
  },
  {
    id: 'sarcastic',
    label: 'Sarcastic',
    lines: ['Write it down.', 'Or just remember. Sure.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(139,92,246,0.2),transparent)]',
    sample:
      "Water the monstera on Friday. Because apparently, it can't manage a sip on its own.\n\nRepot the basil when the roots show up. As if basil roots have a schedule or something.",
  },
  {
    id: 'silly',
    label: 'Silly',
    lines: ['Scribble it down.', 'Boop. Ta-da, found it!'],
    glow: 'bg-[radial-gradient(closest-side,rgba(163,230,53,0.12),transparent)]',
    sample:
      "Friday is the grand splash-fest for the mighty monstera! 💦\n\nWhen the basil's roots peek out like curious little spaghetti noodles, it's big move day.",
  },
  {
    id: 'summary-scholar',
    label: 'Summary scholar',
    lines: ['In summary:', 'write once, find fast.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(45,212,191,0.16),transparent)]',
    sample: '- Water the monstera on Friday\n- Repot the basil when roots appear',
  },
  {
    id: 'zen',
    label: 'Zen',
    lines: ['Breathe. Write it down.', 'It will be found.'],
    glow: 'bg-[radial-gradient(closest-side,rgba(110,231,183,0.12),transparent)]',
    sample:
      'On Friday, water the monstera. Notice how the leaves respond.\n\nRepot the basil when its roots appear. Ease it gently into new soil.',
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
