'use client';

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type EmotionTag } from '@/lib/db';
import type { EmotionDigest, EmotionEvent } from '@/hooks/useEmotionDigest';

/**
 * 情绪卡片点击后的当日详情抽屉（v2.3 新增）。
 *
 * 三段内容：
 *  1. 情绪轨迹：当日每条 emotion 一根细条，高度=score 0-10，颜色=主标签 mood-tone
 *  2. 这天面的：当日全部 events（不再限制 3 个）
 *  3. 那天你说的：当日全部 user messages 前 5 条 + "还有 N 条"
 *
 * 数据按需查（只在抽屉打开时挂载），避免冷启动一次性把所有日的细节拉出来。
 */

interface Props {
  digest: EmotionDigest;
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtTime = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const eventHeader = (e: EmotionEvent) =>
  [e.company, e.jobPosition, e.interviewStage].filter(Boolean).join(' · ') ||
  '一场面试';

/** 把当日 string YYYY-MM-DD 转 ts 起止区间 */
function dayRange(dateStr: string): [number, number] {
  const [y, m, d] = dateStr.split('-').map(Number);
  return [
    new Date(y, m - 1, d, 0, 0, 0, 0).getTime(),
    new Date(y, m - 1, d, 23, 59, 59, 999).getTime(),
  ];
}

/** 情绪轨迹小条形图 —— 每条 emotion 一根，按主标签染色 */
const TRACK_TONE: Record<EmotionTag, string> = {
  平静: 'bg-mood-warm',
  兴奋: 'bg-mood-warm',
  侥幸: 'bg-mood-warm',
  挫败: 'bg-mood-pink',
  自我否定: 'bg-mood-pink',
  焦虑: 'bg-mood-blue',
  迷茫: 'bg-mood-blue',
  麻木: 'bg-mood-blue',
};

export function EmotionDayDetail({ digest }: Props) {
  const [start, end] = useMemo(() => dayRange(digest.date), [digest.date]);

  const emotions =
    useLiveQuery(
      () =>
        db.emotions
          .where('createdAt')
          .between(start, end, true, true)
          .sortBy('createdAt'),
      [start, end],
      [],
    ) ?? [];

  const userMessages =
    useLiveQuery(
      async () => {
        const rows = await db.messages
          .where('createdAt')
          .between(start, end, true, true)
          .sortBy('createdAt');
        return rows.filter((m) => m.role === 'user');
      },
      [start, end],
      [],
    ) ?? [];

  const previewMessages = userMessages.slice(0, 5);
  const hiddenMessageCount = userMessages.length - previewMessages.length;

  return (
    <div className="flex max-h-[75dvh] flex-col">
      {/* 标题 */}
      <div className="mb-3 shrink-0">
        <h3 className="text-h3 text-ink">
          {digest.label} · {digest.topTag}
        </h3>
        <p className="mt-0.5 text-caption text-ink-soft">
          平均分 {digest.avgScore} · {digest.count} 条情绪记录
        </p>
      </div>

      <div className="scroll-soft flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {/* 情绪轨迹（≥2 条才显示，1 条没必要）*/}
        {emotions.length >= 2 && (
          <section>
            <h4 className="mb-2 px-1 text-caption text-ink-soft">情绪轨迹</h4>
            <div className="flex h-12 items-end gap-0.5 rounded-card bg-subtle px-2 py-2">
              {emotions.map((e) => {
                const mainTag = e.tags[0] ?? '平静';
                const tone = TRACK_TONE[mainTag] ?? TRACK_TONE['平静'];
                const heightPct = Math.max(8, e.score * 10);
                return (
                  <div
                    key={e.id}
                    className={`flex-1 rounded-sm ${tone}`}
                    style={{ height: `${heightPct}%` }}
                    title={`${fmtTime(e.createdAt)} · ${e.tags.join('/')} · ${e.score}`}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-between px-2 text-mini text-ink-mute">
              <span>{fmtTime(emotions[0].createdAt)}</span>
              <span>{fmtTime(emotions[emotions.length - 1].createdAt)}</span>
            </div>
          </section>
        )}

        {/* 事件 */}
        {digest.events.length > 0 && (
          <section>
            <h4 className="mb-2 px-1 text-caption text-ink-soft">
              这天面的（{digest.events.length}）
            </h4>
            <div className="flex flex-col gap-1.5">
              {digest.events.map((e) => (
                <div
                  key={e.reviewId}
                  className="rounded-card border border-line bg-card px-3 py-2 text-body-ui text-ink"
                >
                  {eventHeader(e)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 聊天摘录 */}
        {previewMessages.length > 0 && (
          <section>
            <h4 className="mb-2 px-1 text-caption text-ink-soft">
              那天你说的（{userMessages.length}）
            </h4>
            <div className="flex flex-col gap-2">
              {previewMessages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-bubble border border-line bg-card px-3 py-2 text-body-ui text-ink"
                >
                  <div className="mb-0.5 text-mini text-ink-mute">
                    {fmtTime(m.createdAt)}
                  </div>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))}
              {hiddenMessageCount > 0 && (
                <p className="px-2 text-mini text-ink-mute">
                  还有 {hiddenMessageCount} 条…可以去小本本里翻
                </p>
              )}
            </div>
          </section>
        )}

        {/* 空兜底 */}
        {emotions.length < 2 &&
          digest.events.length === 0 &&
          previewMessages.length === 0 && (
            <p className="py-6 text-center text-caption text-ink-mute">
              这天数据不太够，再来跟我说说？
            </p>
          )}
      </div>
    </div>
  );
}
