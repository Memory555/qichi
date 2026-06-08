'use client';

import { useMemo, useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { ReviewCard } from '@/components/notebook/ReviewCard';
import { useReviews } from '@/hooks/useReviews';

export default function NotebookPage() {
  const [showHidden, setShowHidden] = useState(false);
  const all = useReviews(true);

  const { visible, hidden } = useMemo(
    () => ({
      visible: all.filter((r) => !r.hidden),
      hidden: all.filter((r) => r.hidden),
    }),
    [all],
  );

  const list = showHidden ? hidden : visible;
  const showHiddenEntry = !showHidden && hidden.length > 0;

  return (
    <>
      <AppBar
        left={
          <span className="text-h3 text-ink">
            {showHidden ? `已隐藏 (${hidden.length})` : '小本本'}
          </span>
        }
        right={
          showHidden ? (
            <button
              type="button"
              onClick={() => setShowHidden(false)}
              className="rounded-pill px-3 py-1 text-caption text-brand hover:bg-brand-pale"
            >
              返回
            </button>
          ) : showHiddenEntry ? (
            <button
              type="button"
              onClick={() => setShowHidden(true)}
              className="rounded-pill px-3 py-1 text-caption text-ink-soft hover:bg-subtle"
            >
              已隐藏 {hidden.length}
            </button>
          ) : null
        }
      />

      {list.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-body-em font-light leading-relaxed text-ink-soft">
            {showHidden ? (
              '没有隐藏起来的内容。'
            ) : (
              <>
                这里还没有什么需要记下的。
                <br />
                你跟我说过的事，我会慢慢记。
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="scroll-soft flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {list.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </>
  );
}
