'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'text' | 'soft';
type Size = 'lg' | 'md' | 'sm';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand text-ink-on hover:bg-brand-deep active:bg-brand-deep active:scale-[0.98] disabled:bg-ink-disabled disabled:text-ink-on',
  secondary:
    'bg-transparent border-[1.5px] border-brand text-brand hover:bg-brand-pale active:bg-brand-soft disabled:border-ink-disabled disabled:text-ink-mute',
  text: 'bg-transparent text-brand hover:underline active:text-brand-deep disabled:text-ink-mute',
  soft: 'bg-brand-soft text-ink hover:bg-brand-pale active:bg-[#F5C98C] disabled:bg-subtle disabled:text-ink-mute',
};

const sizeClasses: Record<Size, string> = {
  lg: 'h-12 px-6 text-base font-medium',
  md: 'h-10 px-5 text-body-ui font-medium',
  sm: 'h-8 px-4 text-caption font-medium',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'lg',
    fullWidth = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-pill transition-all duration-soft ease-soft outline-none focus-visible:ring-2 focus-visible:ring-brand',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
