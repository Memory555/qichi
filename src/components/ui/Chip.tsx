import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'warm' | 'pink' | 'blue';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  active?: boolean;
}

const toneClasses: Record<Tone, string> = {
  warm: 'bg-brand-soft text-chip-warm',
  pink: 'bg-mood-pink text-chip-pink',
  blue: 'bg-mood-blue text-chip-blue',
};

export function Chip({
  tone = 'warm',
  active = false,
  className,
  ...rest
}: Props) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-[12px] px-3 text-caption transition-colors',
        active ? 'bg-brand text-ink-on' : toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}
