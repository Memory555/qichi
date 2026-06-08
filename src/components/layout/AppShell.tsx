import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
}

/** 移动端为主、桌面端居中 480px 的壳 */
export function AppShell({ children, className }: Props) {
  return (
    <div className={cn('app-shell flex flex-col bg-page', className)}>
      {children}
    </div>
  );
}
