'use client';

import { useEffect, type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
  danger?: boolean;
}

/** 居中弹窗（确认 / 取消两按钮 + 可选自定义 body） */
export function Dialog({
  open,
  onClose,
  title,
  body,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  confirmDisabled,
  danger,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center px-6"
    >
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />
      <div className="relative z-10 w-full max-w-xs rounded-card-lg bg-page p-6 shadow-soft-lg">
        <h2 className="mb-2 text-h3 text-ink">{title}</h2>
        {body && (
          <div className="mb-4 text-body-ui leading-relaxed text-ink-soft">
            {body}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="soft" size="md" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className={cn(
              danger && 'bg-danger hover:bg-[#C25F40] active:bg-[#B85A3E]',
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
