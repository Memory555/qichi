'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types';

interface Props {
  messages: Message[];
  onTranslate: (id: number) => void;
  translatingId?: number;
  failedId?: number;
  emptyPlaceholder?: string;
}

export function MessageList({
  messages,
  onTranslate,
  translatingId,
  failedId,
  emptyPlaceholder,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  // 新消息自动滚到底
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-body-em font-light text-ink-soft">
          {emptyPlaceholder ?? ''}
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-soft flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 pt-2">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          onTranslate={onTranslate}
          translating={translatingId === m.id}
          failed={failedId === m.id}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
