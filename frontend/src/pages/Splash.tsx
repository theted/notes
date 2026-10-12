import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import {
  splashSequence,
  splashLeave,
  splashItem,
  remixLine,
  remixWord,
  pillSlide,
  glowFade,
  buttonHoverTap,
  inputFocus,
} from '../config/animations';
import { splashHeadline, splashHeadlineBox, splashColumn, chipBase } from '../config/styles';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../lib/utils';

// The headline in each of the remix personas (backend/src/personas), plus the original
const VOICES = [
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
] as const;

type VoiceId = (typeof VOICES)[number]['id'];

const CYCLE_MS = 4200;

const Splash: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceId, setVoiceId] = useState<VoiceId>('plain');
  const [auto, setAuto] = useState(true);
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const firstRemix = useRef(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as unknown as { state?: { from?: { pathname?: string } } };
  const from = location?.state?.from?.pathname || '/';

  const voiceIndex = VOICES.findIndex((v) => v.id === voiceId);
  const voice = VOICES[voiceIndex];
  // Remix on its own until someone picks a voice or starts typing
  const cycling = auto && !reduceMotion && !pwd;

  useEffect(() => {
    if (!cycling) return;
    const t = window.setTimeout(
      () => setVoiceId(VOICES[(voiceIndex + 1) % VOICES.length].id),
      CYCLE_MS,
    );
    return () => window.clearTimeout(t);
  }, [cycling, voiceIndex]);

  useEffect(() => {
    firstRemix.current = false;
  }, []);

  // Straight to the password on desktop; on touch screens a focused field pops the keyboard
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches)
      inputRef.current?.focus({ preventScroll: true });
  }, []);

  const pickVoice = (id: VoiceId) => {
    setAuto(false);
    setVoiceId(id);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Chrome hides an autofilled password from React until the first user gesture, so read the field
    const password = pwd || inputRef.current?.value || '';
    if (!password) {
      inputRef.current?.focus();
      setError('Enter a password to open your notebook.');
      return;
    }
    setLoading(true);
    setError(null);
    const ok = await login(password);
    setLoading(false);
    if (ok) navigate(from, { replace: true });
    else setError("Couldn't open your notebook. Check your connection and try again.");
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* Own presence boundary: the router's AnimatePresence skips initial animations on a hard load */}
      <motion.div className="relative min-h-screen overflow-hidden" {...splashLeave}>
        <AnimatePresence>
          <motion.div key="splash" {...splashSequence}>
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <AnimatePresence initial={false}>
                <motion.div
                  key={voice.id}
                  className={cn(
                    'absolute -left-[20vmax] -top-[12vmax] w-[85vmax] h-[65vmax] blur-2xl',
                    voice.glow,
                  )}
                  {...glowFade}
                />
              </AnimatePresence>
            </div>

            <header className={`${splashColumn} relative h-16 flex items-center`}>
              <motion.div className="text-2xl font-extralight tracking-tight" {...splashItem}>
                Notes
              </motion.div>
            </header>

            <main
              className={`${splashColumn} relative min-h-[calc(100vh-4rem)] flex flex-col justify-center pb-24`}
            >
              <motion.div layout="position" className={splashHeadlineBox}>
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={voice.id}
                    className={splashHeadline}
                    variants={remixLine}
                    initial="hidden"
                    animate="show"
                    exit="leave"
                    custom={firstRemix.current ? 0.15 : 0}
                  >
                    {voice.lines.map((line) => (
                      <span key={line} className="block">
                        {line.split(' ').map((word, i) => (
                          <React.Fragment key={`${word}-${i}`}>
                            <motion.span className="inline-block" variants={remixWord}>
                              {word}
                            </motion.span>{' '}
                          </React.Fragment>
                        ))}
                      </span>
                    ))}
                  </motion.h1>
                </AnimatePresence>
              </motion.div>

              <motion.div
                layout="position"
                className="mt-8 flex flex-wrap items-center gap-x-1.5 gap-y-2"
                {...splashItem}
              >
                <span className="mr-1.5 text-sm text-gray-400">Remix as</span>
                {VOICES.map((v) => {
                  const active = v.id === voice.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => pickVoice(v.id)}
                      className={cn(
                        chipBase,
                        active ? 'text-white' : 'text-gray-400 hover:text-gray-200',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="voice-pill"
                          transition={pillSlide}
                          className="absolute inset-0 -z-10 rounded-full bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/40"
                        >
                          {cycling && (
                            <motion.span
                              key={v.id}
                              className="absolute inset-0 origin-left bg-indigo-400/20"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }}
                            />
                          )}
                        </motion.span>
                      )}
                      {v.label}
                    </button>
                  );
                })}
              </motion.div>

              <motion.p
                layout="position"
                className="mt-8 max-w-[34rem] text-lg font-light leading-relaxed text-gray-300"
                {...splashItem}
              >
                Markdown notes with fuzzy search that forgives typos, a shortcut for every action,
                and an AI remix that rewrites a note in another voice.
              </motion.p>

              <motion.form
                layout="position"
                onSubmit={onSubmit}
                className="mt-10 w-full max-w-xl"
                {...splashItem}
              >
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <motion.div className="flex-1" {...inputFocus}>
                    <Input
                      id="password"
                      ref={inputRef}
                      type="password"
                      autoComplete="current-password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      placeholder="Password"
                    />
                  </motion.div>
                  <motion.div {...buttonHoverTap}>
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                      {loading ? 'Opening…' : 'Open notebook'}
                    </Button>
                  </motion.div>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      role="alert"
                      className="mt-3 text-sm text-red-400"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="mt-3 text-sm text-gray-400">
                  Your password is your login. A new one starts a fresh notebook.
                </p>
              </motion.form>
            </main>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
};

export default Splash;
