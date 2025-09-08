import React from 'react';

type Toast = {
  id: number;
  title?: string;
  description?: string;
  duration?: number; // ms
};

type ToastContextValue = {
  show: (t: Omit<Toast, 'id'>) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const show = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toast: Toast = { id, duration: 2000, ...t };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, toast.duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="min-w-[220px] max-w-sm rounded-xl bg-black/80 ring-1 ring-white/10 shadow-xl backdrop-blur px-4 py-3"
          >
            {t.title ? (
              <div className="text-sm font-medium text-white">{t.title}</div>
            ) : null}
            {t.description ? (
              <div className="text-sm text-gray-300 mt-0.5">{t.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

