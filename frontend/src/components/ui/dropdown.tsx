import * as React from 'react';
import { cn } from '../../lib/utils';

type DropdownContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export const Dropdown: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...rest
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={cn('relative inline-block text-left', className)} {...rest}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)!;
    return (
      <button
        ref={ref}
        onClick={(e) => {
          ctx.setOpen(!ctx.open);
          onClick?.(e);
        }}
        className={cn('inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15', className)}
        {...props}
      />
    );
  },
);
DropdownTrigger.displayName = 'DropdownTrigger';

export const DropdownContent: React.FC<{
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}> = ({ children, align = 'start', className }) => {
  const ctx = React.useContext(DropdownContext)!;
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-white/10 bg-black/90 shadow-xl backdrop-blur p-1',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
      role="menu"
    >
      {children}
    </div>
  );
};

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, ...props }) => {
  const ctx = React.useContext(DropdownContext)!;
  return (
    <button
      onClick={(e) => {
        ctx.setOpen(false);
        props.onClick?.(e);
      }}
      className={cn(
        'w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60',
        className,
      )}
      role="menuitem"
      {...props}
    />
  );
};

export default Dropdown;

