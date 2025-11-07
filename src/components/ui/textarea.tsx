import * as React from 'react';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm transition-colors',
        'placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:border-transparent',
        'hover:border-slate-300',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
        'resize-y',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
