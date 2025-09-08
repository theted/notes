import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  password: string | null;
  isAuthed: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [password, setPassword] = useState<string | null>(() => localStorage.getItem('password'));
  const [isAuthed, setIsAuthed] = useState<boolean>(!!password);

  useEffect(() => {
    if (password) localStorage.setItem('password', password);
    else localStorage.removeItem('password');
  }, [password]);

  const login = useCallback(async (pwd: string) => {
    try {
      const base =
        (import.meta as unknown as { env: { VITE_API_BASE?: string } }).env.VITE_API_BASE ?? '/api';
      const res = await fetch(base + '/auth', {
        headers: { 'X-Password': pwd },
      });
      if (res.ok) {
        setPassword(pwd);
        setIsAuthed(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setPassword(null);
    setIsAuthed(false);
  }, []);

  const value = useMemo(
    () => ({ password, isAuthed, login, logout }),
    [password, isAuthed, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
