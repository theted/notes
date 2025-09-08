import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  loginSwoosh as pageEnter,
  headlineEnter,
  buttonHoverTap,
  inputFocus,
} from '../config/animations';
import { container, headline } from '../config/styles';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { useAuth } from '../auth/AuthContext';

const Login: React.FC = () => {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as unknown as { state?: { from?: { pathname?: string } } };
  const from = location?.state?.from?.pathname || '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(pwd);
    setLoading(false);
    if (ok) navigate(from, { replace: true });
    else setError('Login error');
  };

  return (
    <motion.div className={`${container} min-h-screen grid place-content-center`} {...pageEnter}>
      <header className="mb-8 text-center">
        <motion.h1 className={headline} {...headlineEnter}>
          Welcome
        </motion.h1>
        <div className="text-gray-400 mt-2">Your password is your login</div>
      </header>
      <form onSubmit={onSubmit} className="max-w-md mx-auto w-[min(90vw,28rem)]">
        <motion.div {...inputFocus}>
          <Input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
          />
        </motion.div>
        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        <motion.div className="mt-4" {...buttonHoverTap}>
          <Button type="submit" disabled={!pwd || loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Login;
