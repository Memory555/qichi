'use client';

import { Icon } from '@/components/ui/Icon';
import { ICONS } from '@/lib/assets';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface Props {
  message: Message;
  onTranslate?: (id: number) => void;
  translating?: boolean;
  failed?: boolean;
}

export function MessageBubble({
  message,
  onTranslate,
  translating,
  failed,
}: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-bubble rounded-br-[4px] border-[1.5px] border-line bg-card/90 px-4 py-3 text-body-ui text-ink shadow-soft-xs backdrop-blur-[2px]">
          {message.text}
        </div>
      </div>
    );
  }

  // pet 气泡
  const hasTranslation = !!message.translatedText;
  const showFailed = failed && !hasTranslation;
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-end gap-2">
        <div
          className="rounded-bubble rounded-bl-[4px] px-4 py-3 text-body-ui text-ink shadow-soft-sm backdrop-blur-[2px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(252, 217, 168, 0.95), rgba(255, 239, 201, 0.95))',
          }}
        >
          {message.text}
        </div>
        {!hasTranslation && message.id !== undefined && onTranslate && (
          <button
            type="button"
            onClick={() => onTranslate(message.id!)}
            disabled={translating}
            aria-label="翻译"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full',
              'hover:bg-brand-pale active:bg-brand-soft transition-colors',
              'disabled:opacity-50',
            )}
          >
            {translating ? (
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand [animation-delay:200ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand [animation-delay:400ms]" />
              </span>
            ) : (
              <Icon src={ICONS.action.translate} size={18} alt="" />
            )}
          </button>
        )}
      </div>

      {hasTranslation && (
        <div
          className="ml-1 max-w-[85%] animate-fade-in rounded-bubble px-4 py-3 text-body-em font-light text-ink shadow-soft-xs backdrop-blur-[2px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 239, 201, 0.85), rgba(252, 217, 168, 0.75))',
          }}
        >
          {message.translatedText}
        </div>
      )}

      {showFailed && (
        <button
          type="button"
          onClick={() => message.id !== undefined && onTranslate?.(message.id)}
          className="ml-1 text-caption text-danger hover:underline"
        >
          我有点走神了，再点一下？
        </button>
      )}
    </div>
  );
}
