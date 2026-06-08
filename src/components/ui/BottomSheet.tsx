'use client';

import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** 通用底部抽屉：点击半透明遮罩或 ESC 关闭 */
export function BottomSheet({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in"
    >
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <div className="relative z-10 animate-slide-up rounded-t-[24px] bg-page p-6 shadow-soft-lg">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-disabled" />
        {children}
      </div>
    </div>
  );
}
