'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export interface MoodPoint {
  /** YYYY-MM-DD（本地时区） */
  date: string;
  /** 该日平均情绪分值 0-10 */
  score: number;
  /** 该日最低分（用于显示日波动范围） */
  min: number;
  /** 该日最高分 */
  max: number;
  /** 该日数据点数（>1 时 tooltip 提示有波动） */
  count: number;
  /** 用于 X 轴显示的短日期，如 "6.4" */
  label: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalISODate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toShortLabel(isoDate: string): string {
  const [, mm, dd] = isoDate.split('-');
  return `${Number(mm)}.${Number(dd)}`;
}

/**
 * 按日聚合最近 N 天的情绪分值。
 * days 传 0 表示「全部」。
 *
 * 聚合策略：
 * - score（曲线主线）= 该日平均分
 * - min / max（tooltip 显示）= 该日最低/最高，揭示单日波动
 * - count = 该日记录数，>1 时提示"有波动"
 */
export function useEmotionTimeline(days = 30): MoodPoint[] {
  return (
    useLiveQuery(
      async () => {
        const sinceTs = days > 0 ? Date.now() - days * DAY_MS : 0;
        const rows = await db.emotions
          .where('createdAt')
          .above(sinceTs)
          .toArray();

        const byDay = new Map<
          string,
          { sum: number; count: number; min: number; max: number }
        >();
        for (const e of rows) {
          const day = toLocalISODate(e.createdAt);
          const cur = byDay.get(day);
          if (cur) {
            cur.sum += e.score;
            cur.count += 1;
            cur.min = Math.min(cur.min, e.score);
            cur.max = Math.max(cur.max, e.score);
          } else {
            byDay.set(day, {
              sum: e.score,
              count: 1,
              min: e.score,
              max: e.score,
            });
          }
        }

        return Array.from(byDay.entries())
          .map(([date, { sum, count, min, max }]) => ({
            date,
            score: Number((sum / count).toFixed(2)),
            min,
            max,
            count,
            label: toShortLabel(date),
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },
      [days],
      [],
    ) ?? []
  );
}
