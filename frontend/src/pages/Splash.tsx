import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { enterItem, remixLine, buttonHoverTap, inputFocus } from '../config/animations';
import { splashHeadline, splashHeadlineBox, column } from '../config/styles';
import { VOICES } from '../config/voices';
import Page from '../components/Page';
import BlurWords from '../components/BlurWords';
import VoiceGlow from '../components/VoiceGlow';
import VoiceChips from '../components/VoiceChips';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { useAuth } from '../auth/AuthContext';

const CYCLE_MS = 4200;

const Splash: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
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

  const pickVoice = (id: string) => {
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
    <Page className="relative min-h-screen overflow-hidden">
      <VoiceGlow voice={voice} />

      <header className={`${column} relative h-16 flex items-center`}>
        <motion.div className="text-2xl font-extralight tracking-tight" {...enterItem}>
          Notes
        </motion.div>
      </header>

      <main
        className={`${column} relative min-h-[calc(100vh-4rem)] flex flex-col justify-center pb-24`}
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
                  <BlurWords text={line} />
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        <motion.div layout="position" className="mt-8" {...enterItem}>
          <VoiceChips
            voices={VOICES}
            activeId={voice.id}
            onPick={pickVoice}
            indicator={
              cycling && (
                <motion.span
                  key={voice.id}
                  className="absolute inset-0 origin-left bg-indigo-400/20"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }}
                />
              )
            }
          />
        </motion.div>

        <motion.p
          layout="position"
          className="mt-8 max-w-[34rem] text-lg font-light leading-relaxed text-gray-300"
          {...enterItem}
        >
          Markdown notes with fuzzy search that forgives typos, a shortcut for every action, and an
          AI remix that rewrites a note in another voice.
        </motion.p>

        <motion.form
          layout="position"
          onSubmit={onSubmit}
          className="mt-10 w-full max-w-xl"
          {...enterItem}
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
    </Page>
  );
};

export default Splash;
