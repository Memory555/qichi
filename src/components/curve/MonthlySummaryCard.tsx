'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useCurrentPet } from '@/hooks/useCurrentPet';
import {
  buildMonthlyInput,
  readSummaryCache,
  writeSummaryCache,
} from '@/lib/monthly';

/**
 * 月度总结卡片
 *
 * 进入曲线页时检查本月缓存：
 * - 有缓存 → 直接显示
 * - 无缓存 + 本月有 ≥5 条消息 → 调 /api/monthly 生成并写缓存
 * - 数据不足 → 不显示
 */
export function MonthlySummaryCard() {
  const { pet } = useCurrentPet();
  const [summary, setSummary] = useState<string>('');
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'skip'>(
    'idle',
  );

  useEffect(() => {
    if (!pet) return;
    let cancelled = false;

    (async () => {
      // 1. 优先看缓存
      const cached = readSummaryCache();
      if (cached) {
        if (!cancelled) {
          setSummary(cached);
          setState('ready');
        }
        return;
      }

      // 2. 算月度输入；数据太少就跳过
      const input = await buildMonthlyInput();
      if (!input || input.totalMessages < 5) {
        if (!cancelled) setState('skip');
        return;
      }

      // 3. 调 /api/monthly
      if (!cancelled) setState('loading');
      try {
        const res = await fetch('/api/monthly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petType: pet.pet,
            petName: pet.name,
            emotionTimeline: input.emotionTimeline,
            interviewDigest: input.interviewDigest,
            totalDays: input.totalDays,
            totalMessages: input.totalMessages,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { summary?: string };
        if (data.summary) {
          writeSummaryCache(data.summary);
          if (!cancelled) {
            setSummary(data.summary);
            setState('ready');
          }
        }
      } catch (e) {
        console.warn('[monthly] generate failed', e);
        if (!cancelled) setState('skip');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pet]);

  if (state === 'idle' || state === 'skip') return null;

  if (state === 'loading') {
    return (
      <Card className="bg-brand-pale">
        <h3 className="mb-2 text-caption text-ink-soft">这个月</h3>
        <p className="text-body-em font-light text-ink-mute">
          总结生成中…
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-brand-pale">
      <h3 className="mb-2 text-caption text-ink-soft">这个月</h3>
      <p className="text-body-em font-light leading-relaxed text-ink">
        {summary}
      </p>
    </Card>
  );
}
