'use client';

import { useState, useEffect, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { ICONS } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface Props {
  placeholder?: string;
  disabled?: boolean;
  onSend: (text: string) => void;
  /**
   * 输入态变化时回调：input 非空 → true；清空 → false。
   * 用于驱动宠物姿态切到 listen。
   */
  onTypingChange?: (typing: boolean) => void;
}

export function MessageInput({
  placeholder,
  disabled,
  onSend,
  onTypingChange,
}: Props) {
  const [value, setValue] = useState('');

  // 输入态上报（仅在 typing 状态变化时通知，避免每个 keystroke 都触发 re-render）
  useEffect(() => {
    onTypingChange?.(value.trim().length > 0);
  }, [value, onTypingChange]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex items-center gap-2 border-t border-line bg-page px-5 py-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label="发送"
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-soft active:scale-95',
          canSend
            ? 'bg-brand hover:bg-brand-deep'
            : 'bg-ink-disabled cursor-not-allowed',
        )}
      >
        <Image
          src={ICONS.action.send}
          alt=""
          width={18}
          height={18}
          className="invert brightness-200"
        />
      </button>
    </div>
  );
}
