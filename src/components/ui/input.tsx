import * as React from 'react';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm transition-colors',
        'placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:border-transparent',
        'hover:border-slate-300',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
