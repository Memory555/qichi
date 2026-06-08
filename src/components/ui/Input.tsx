'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { error, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-pill border bg-card px-4 text-body-ui text-ink placeholder:text-ink-mute',
        'outline-none transition-all duration-soft ease-soft',
        'focus:border-brand focus:border-[1.5px] focus:shadow-soft-sm',
        error
          ? 'border-danger border-[1.5px]'
          : 'border-line',
        'disabled:bg-subtle disabled:text-ink-mute',
        className,
      )}
      {...rest}
    />
  );
});
