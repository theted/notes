import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import Login from './pages/Login';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
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
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
          {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> : null}
        </AuthProvider>
      </QueryClientProvider>
    </div>
  </React.StrictMode>,
);
