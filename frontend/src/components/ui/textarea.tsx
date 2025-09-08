import * as React from 'react';
import { cn } from '../../lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'w-full mt-2 px-4 py-3 text-base rounded-xl bg-white/5 ring-1 ring-white/10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 transition',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;

