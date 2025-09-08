import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import Login from './pages/Login';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
const ReactQueryDevtoolsLazy = React.lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
);
import './index.css';
import { ToastProvider } from './components/ui/toast';

const Routed = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={(
            <RequireAuth>
              <Home />
            </RequireAuth>
          )}
        />
        <Route
          path="/notes/:id"
          element={(
            <RequireAuth>
              <NoteDetail />
            </RequireAuth>
          )}
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routed />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
            {import.meta.env.DEV ? (
              <React.Suspense fallback={null}>
                <ReactQueryDevtoolsLazy initialIsOpen={false} position="bottom-right" />
              </React.Suspense>
            ) : null}
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  </React.StrictMode>,
);
