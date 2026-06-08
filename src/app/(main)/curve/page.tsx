'use client';

import { useMemo, useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { MoodChart } from '@/components/curve/MoodChart';
import { MonthlySummaryCard } from '@/components/curve/MonthlySummaryCard';
import { useEmotionTimeline } from '@/hooks/useEmotionTimeline';
import { cn } from '@/lib/utils';

type Range = 7 | 30 | 0; // 0 = 全部

const RANGES: { value: Range; label: string }[] = [
  { value: 30, label: '近 30 天' },
  { value: 7, label: '近 7 天' },
  { value: 0, label: '全部' },
];

export default function CurvePage() {
  const [range, setRange] = useState<Range>(30);
  const data = useEmotionTimeline(range);

  // 高频心境 top 3
  const topMoodTags = useMemo<string[]>(() => {
    // 简化：曲线页暂只汇总趋势，标签可在后续从 emotions 表统计；此处占位
    return [];
  }, [data]);

  const isEmpty = data.length === 0;
  const tooFew = data.length > 0 && data.length < 3;

  return (
    <>
      <AppBar left={<span className="text-h3 text-ink">心境</span>} />

      <div className="scroll-soft flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        {/* 时间范围切换 */}
        <div className="flex gap-2">
          {RANGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              aria-pressed={range === value}
              className={cn(
                'inline-flex h-7 items-center rounded-[12px] px-3 text-caption transition-colors',
                range === value
                  ? 'bg-brand text-ink-on'
                  : 'bg-brand-soft text-chip-warm',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 折线图 */}
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center pt-12 text-center">
            <p className="text-body-em font-light leading-relaxed text-ink-soft">
              再聊几天，这里会出现一条线。
            </p>
          </div>
        ) : tooFew ? (
          <Card variant="empty">
            <p className="text-center text-body-em font-light text-ink-soft">
              先零星地，慢慢就会成线了。
              <br />
              <span className="text-caption">
                目前 {data.length} 条记录
              </span>
            </p>
          </Card>
        ) : (
          <>
            <Card className="px-2">
              <MoodChart data={data} />
            </Card>
            <Card className="bg-brand-pale">
              <p className="text-body-em font-light leading-relaxed text-ink">
                这段时间一共 {data.length} 天有记录，平均心境分{' '}
                {(
                  data.reduce((s, d) => s + d.score, 0) / data.length
                ).toFixed(1)}
                。
              </p>
            </Card>
          </>
        )}

        {/* 月度网友体总结（本月数据 ≥ 5 条才出现） */}
        <MonthlySummaryCard />
      </div>
    </>
  );
}
