import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'empty';
}

export function Card({ variant = 'default', className, ...rest }: Props) {
  return (
    <div
      className={cn(
        'rounded-card p-5',
        variant === 'default' && 'bg-card shadow-soft-md',
        variant === 'empty' &&
          'bg-subtle border border-dashed border-line',
        className,
      )}
      {...rest}
    />
  );
}
