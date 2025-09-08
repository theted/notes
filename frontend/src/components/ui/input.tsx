import * as React from 'react';
import { cn } from '../../lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-4 h-11 text-base rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
export default Input;

