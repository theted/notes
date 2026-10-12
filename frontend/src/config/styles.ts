export const container = 'max-w-4xl mx-auto p-8 md:p-10';
export const headline = 'text-4xl md:text-5xl font-extralight tracking-tight';
// Sized so every voice's longest line (~10em) fits the 848px column on two lines. On phones the
// longer voices wrap to three, and the content below glides to make room (layout="position").
export const splashHeadlineBox = 'text-[clamp(2.25rem,7vw,5rem)] min-h-[2.1em]';
export const splashHeadline = 'font-extralight leading-[1.04] tracking-[-0.035em]';
// Same column and gutter as TopBar, so the wordmark doesn't move on sign-in
export const splashColumn = 'max-w-4xl mx-auto px-6';

export const chipBase =
  'relative isolate overflow-hidden rounded-full px-3 h-8 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60';

export const inputBase =
  'w-full px-4 py-3 text-base rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition';
export const textareaBase =
  'w-full mt-2 px-4 py-3 text-base rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition';

export const buttonPrimary =
  'px-4 py-2 rounded-lg bg-indigo-500/90 disabled:opacity-40 transition shadow-sm';
export const buttonGhost = 'px-3 py-1.5 rounded-lg bg-white/10 transition';
export const buttonDanger = 'px-3 py-1.5 rounded-lg bg-red-500/90 transition';

export const cardBase = 'rounded-xl ring-1 ring-white/10 bg-white/5 shadow-sm';
