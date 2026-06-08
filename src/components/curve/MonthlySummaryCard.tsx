'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useCurrentPet } from '@/hooks/useCurrentPet';
import { useLLMConfig } from '@/hooks/useLLMConfig';
import { generateMonthlySummary } from '@/lib/llm-client';
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
  const { config: llmConfig, configured: llmConfigured } = useLLMConfig();
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

      // 2. 算月度输入；数据太少 / 没填 key 都跳过
      const input = await buildMonthlyInput();
      if (!input || input.totalMessages < 5 || !llmConfigured) {
        if (!cancelled) setState('skip');
        return;
      }

      // 3. 客户端直接调 OpenAI 兼容接口
      if (!cancelled) setState('loading');
      try {
        const text = await generateMonthlySummary(llmConfig, {
          petType: pet.pet,
          petName: pet.name,
          emotionTimeline: input.emotionTimeline,
          interviewDigest: input.interviewDigest,
          totalDays: input.totalDays,
          totalMessages: input.totalMessages,
        });
        if (text) {
          writeSummaryCache(text);
          if (!cancelled) {
            setSummary(text);
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
  }, [pet, llmConfigured, llmConfig]);

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
