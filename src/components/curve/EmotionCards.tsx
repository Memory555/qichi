'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useEmotionDigest } from '@/hooks/useEmotionDigest';
import type { EmotionDigest } from '@/hooks/useEmotionDigest';
import { EmotionDayDetail } from './EmotionDayDetail';
import type { EmotionTag } from '@/types';

/**
 * 情绪卡片列表（v2.3 重设计）。
 *
 * 极简卡片 + 点击展开抽屉的模式：
 * - 卡片只承载 4 件事：日期、主导情绪、平均分（mood 横条）、事件/聊天数
 * - 事件具体内容（公司·岗位）不在卡片上显示——多了塞不下
 * - 点击卡片 → BottomSheet：情绪轨迹小条形图 + 事件列表 + 前 5 条聊天
 *
 * 设计依据：v2.2 用户反馈"事件多了没办法罗列完，可以考虑点击查阅"。
 */

interface Props {
  /** 与曲线时间范围联动；0=全部 */
  days: number;
}

/** 情绪标签 → 视觉 tone（chip 底色 + chip 文字色 + 卡片左侧 4px 边框色） */
const TAG_TONE: Record<
  EmotionTag,
  { chipBg: string; chipFg: string; border: string }
> = {
  // 暖（积极 / 平稳）
  平静: { chipBg: 'bg-mood-warm', chipFg: 'text-chip-warm', border: 'border-l-mood-warm' },
  兴奋: { chipBg: 'bg-mood-warm', chipFg: 'text-chip-warm', border: 'border-l-mood-warm' },
  侥幸: { chipBg: 'bg-mood-warm', chipFg: 'text-chip-warm', border: 'border-l-mood-warm' },
  // 粉（柔软 / 委屈）
  挫败: { chipBg: 'bg-mood-pink', chipFg: 'text-chip-pink', border: 'border-l-mood-pink' },
  自我否定: { chipBg: 'bg-mood-pink', chipFg: 'text-chip-pink', border: 'border-l-mood-pink' },
  // 蓝（低落 / 迷茫）
  焦虑: { chipBg: 'bg-mood-blue', chipFg: 'text-chip-blue', border: 'border-l-mood-blue' },
  迷茫: { chipBg: 'bg-mood-blue', chipFg: 'text-chip-blue', border: 'border-l-mood-blue' },
  麻木: { chipBg: 'bg-mood-blue', chipFg: 'text-chip-blue', border: 'border-l-mood-blue' },
};

/**
 * range → 卡片上限：
 *   7   → 7
 *   30  → 30
 *   0   → 60（避免全部时把上百条全渲，分页留给 v3）
 */
function rangeToLimit(days: number): number {
  if (days === 0) return 60;
  return days;
}

function EmotionCardItem({
  digest,
  onOpen,
}: {
  digest: EmotionDigest;
  onOpen: () => void;
}) {
  const tone = TAG_TONE[digest.topTag] ?? TAG_TONE['平静'];
  const widthPct = Math.max(4, digest.avgScore * 10);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-card border border-line border-l-4 bg-card px-3 py-2.5 text-left transition-colors hover:bg-subtle ${tone.border}`}
    >
      {/* 第一行：日期 + 主导情绪 chip / 右侧事件 + 聊天数 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-caption text-ink">{digest.label}</span>
          <span
            className={`inline-flex h-5 items-center rounded-[10px] px-2 text-mini font-medium ${tone.chipBg} ${tone.chipFg}`}
          >
            {digest.topTag}
          </span>
        </div>
        <span className="text-mini text-ink-mute">
          {digest.events.length > 0 && `${digest.events.length} 场 · `}
          {digest.count} 条
        </span>
      </div>

      {/* 第二行：mood 横条 + 分值 + 右侧 ›（点击进入暗示） */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${widthPct}%` }}
          />
        </div>
        <span className="w-7 text-right text-mini tabular-nums text-ink-soft">
          {digest.avgScore}
        </span>
        <span className="text-ink-mute">›</span>
      </div>
    </button>
  );
}

export function EmotionCards({ days }: Props) {
  const digests = useEmotionDigest(days, rangeToLimit(days));
  const [openDate, setOpenDate] = useState<string | null>(null);

  if (digests.length === 0) return null;

  const openDigest = openDate
    ? digests.find((d) => d.date === openDate) ?? null
    : null;

  return (
    <section>
      <h3 className="mb-2 px-1 text-caption text-ink-soft">情绪卡片</h3>
      <div className="flex flex-col gap-2">
        {digests.map((d) => (
          <EmotionCardItem
            key={d.date}
            digest={d}
            onOpen={() => setOpenDate(d.date)}
          />
        ))}
      </div>

      <BottomSheet open={!!openDigest} onClose={() => setOpenDate(null)}>
        {openDigest && <EmotionDayDetail digest={openDigest} />}
      </BottomSheet>
    </section>
  );
}
