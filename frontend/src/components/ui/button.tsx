import * as React from 'react';
import { cn } from '../../lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-sm focus-visible:ring-indigo-400/60',
  secondary:
    'bg-white/10 hover:bg-white/15 text-white focus-visible:ring-indigo-400/60',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-200 focus-visible:ring-white/30',
  outline:
    'bg-transparent border border-white/15 hover:bg-white/5 text-gray-100 focus-visible:ring-white/30',
  destructive:
    'bg-red-500/90 hover:bg-red-500 text-white focus-visible:ring-red-400/60',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export default Button;

