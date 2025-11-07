import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'primary';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-95',
          {
            'bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow': variant === 'default',
            'border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300': variant === 'outline',
            'hover:bg-slate-100 text-slate-700': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow': variant === 'destructive',
            'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md hover:shadow-lg':
              variant === 'primary',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-9 px-3 text-sm': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
