import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

type ModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

const Modal: React.FC<ModalProps> = ({ open, onOpenChange, title, children, className }) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1000]">
          <motion.div
            ref={overlayRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              if (e.target === overlayRef.current) onOpenChange(false);
            }}
          />
          <div
            ref={containerRef}
            className="absolute inset-0 grid place-items-center px-4 py-10"
            onClick={(e) => {
              // Close when clicking on the backdrop area of the container
              if (e.target === containerRef.current) onOpenChange(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                'w-[min(720px,92vw)] rounded-2xl bg-[#0e2a35]/95 ring-1 ring-white/10 shadow-2xl backdrop-blur p-5 md:p-6',
                className,
              )}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {title ? (
                <div className="text-xl font-light tracking-tight mb-3 text-white">{title}</div>
              ) : null}
              {children}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default Modal;
