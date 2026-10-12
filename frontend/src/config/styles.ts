// One column for the wordmark and every page, so nothing shifts between the splash and the notes
export const column = 'max-w-4xl mx-auto px-6';

// Sized so every voice's longest line (~10em) fits the 848px column on two lines. On phones the
// longer voices wrap to three, and the content below glides to make room (layout="position").
export const splashHeadlineBox = 'text-[clamp(2.25rem,7vw,5rem)] min-h-[2.1em]';
export const splashHeadline = 'font-extralight leading-[1.04] tracking-[-0.035em]';
// The signed-in pages' headline: the splash's thin type, a size down
export const pageHeadline =
  'text-[clamp(2.25rem,6vw,3.75rem)] font-extralight leading-[1.06] tracking-[-0.03em] [overflow-wrap:anywhere]';

export const chipBase =
  'relative isolate overflow-hidden rounded-full px-3 h-8 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60';
export const chipPill =
  'absolute inset-0 -z-10 overflow-hidden rounded-full bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/40';

// A light band sweeping across while something works; add a `via-` colour
export const sweep =
  'absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-sweep';

export const kbd =
  'rounded-md bg-white/10 px-1.5 py-0.5 font-sans text-xs text-gray-300 ring-1 ring-inset ring-white/10';

// Glass note card with a cursor-following spotlight (set --x/--y on pointer move)
export const noteCard =
  'relative block overflow-hidden rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition duration-300 hover:bg-white/[0.07] hover:ring-white/20 hover:shadow-[0_24px_60px_-28px_rgba(99,102,241,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:bg-white/[0.07] before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:bg-[radial-gradient(28rem_circle_at_var(--x,50%)_var(--y,0%),rgba(129,140,248,0.16),transparent_60%)] after:pointer-events-none after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent';

export const searchInput =
  'h-14 pl-12 text-lg bg-white/[0.06] backdrop-blur-md placeholder:text-gray-500 focus:bg-white/[0.08] focus:shadow-[0_18px_50px_-24px_rgba(99,102,241,0.8)]';

export const inputBase =
  'w-full px-4 py-3 text-base rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition';
export const textareaBase =
  'w-full mt-2 px-4 py-3 text-base rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition';

export const buttonPrimary =
  'px-4 py-2 rounded-lg bg-indigo-500/90 disabled:opacity-40 transition shadow-sm';
export const buttonGhost = 'px-3 py-1.5 rounded-lg bg-white/10 transition';
export const buttonDanger = 'px-3 py-1.5 rounded-lg bg-red-500/90 transition';
