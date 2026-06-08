import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  left?: ReactNode;
  right?: ReactNode;
  center?: ReactNode;
  className?: string;
}

/** 顶部条 56px，左右插槽 + 可选居中标题 */
export function AppBar({ left, right, center, className }: Props) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between bg-page px-5',
        className,
      )}
    >
      <div className="flex items-center gap-3">{left}</div>
      {center && (
        <div className="absolute left-1/2 -translate-x-1/2 text-h3 text-ink">
          {center}
        </div>
      )}
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}
