import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageEnter, headlineEnter, buttonHoverTap, inputFocus } from '../config/animations';
import { container, headline, inputBase, buttonPrimary } from '../config/styles';
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
    else setError('Incorrect password.');
  };

  return (
    <motion.div className={container} {...pageEnter}>
      <header className="mb-6 text-center">
        <motion.h1 className={headline} {...headlineEnter}>
          Welcome
        </motion.h1>
        <div className="text-gray-400 mt-2">Enter password to access your notes.</div>
      </header>
      <form onSubmit={onSubmit} className="max-w-md mx-auto">
        <motion.input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Password"
          className={inputBase}
          {...inputFocus}
        />
        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        <div className="mt-3">
          <motion.button
            type="submit"
            disabled={!pwd || loading}
            className={buttonPrimary}
            {...buttonHoverTap}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
