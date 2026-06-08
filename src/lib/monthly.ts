/**
 * 栖迟 · 月度总结输入数据构造
 *
 * 从本地 DB 聚合当月数据，包装成 /api/monthly 需要的格式。
 * 结果在 localStorage 缓存，月内只生成一次。
 */

import { db } from './db';

export interface MonthlyInput {
  /** 情绪时间线（按日期 → 主导情绪 + 平均分） */
  emotionTimeline: string;
  /** 面试记录摘要 */
  interviewDigest: string;
  /** 当月有聊天的天数 */
  totalDays: number;
  /** 当月用户消息总条数 */
  totalMessages: number;
}

function monthRange(date = new Date()): [number, number] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return [start.getTime(), end.getTime()];
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toShortDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/** 从 DB 聚合本月数据 → 月度总结输入 */
export async function buildMonthlyInput(): Promise<MonthlyInput | null> {
  const [start, end] = monthRange();

  const [emotions, reviews, messages] = await Promise.all([
    db.emotions.where('createdAt').between(start, end).toArray(),
    db.reviews.where('createdAt').between(start, end).toArray(),
    db.messages
      .where('createdAt')
      .between(start, end)
      .toArray(),
  ]);

  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length === 0) return null;

  // 按日聚合情绪
  const byDay = new Map<string, { tags: Set<string>; sum: number; count: number }>();
  for (const e of emotions) {
    const day = toShortDate(e.createdAt);
    const cur = byDay.get(day) ?? { tags: new Set<string>(), sum: 0, count: 0 };
    e.tags.forEach((t) => cur.tags.add(t));
    cur.sum += e.score;
    cur.count += 1;
    byDay.set(day, cur);
  }

  const emotionTimeline = Array.from(byDay.entries())
    .map(
      ([day, { tags, sum, count }]) =>
        `${day}：${Array.from(tags).join('/')}（均分 ${(sum / count).toFixed(1)}）`,
    )
    .join('；');

  // 面试摘要
  const interviewDigest =
    reviews
      .filter((r) => !r.hidden)
      .map((r) => {
        const header = [r.company, r.jobPosition, r.interviewStage]
          .filter(Boolean)
          .join('·');
        const fails = r.mistakes.length > 0 ? `失误:${r.mistakes.join('/')}` : '';
        const wins = r.strengths.length > 0 ? `亮点:${r.strengths.join('/')}` : '';
        return [header, fails, wins].filter(Boolean).join('，');
      })
      .join('；') || '无面试记录';

  // 当月有数据的天数
  const uniqueDays = new Set(
    userMessages.map((m) => {
      const d = new Date(m.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );

  return {
    emotionTimeline: emotionTimeline || '无明显情绪记录',
    interviewDigest,
    totalDays: uniqueDays.size,
    totalMessages: userMessages.length,
  };
}

// ─── localStorage 缓存 ─────────────────────────

const KEY = (month: string) => `qichi:summary:${month}`;

export function readSummaryCache(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY(currentMonthKey()));
}

export function writeSummaryCache(text: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY(currentMonthKey()), text);
}

/** 清空所有月度总结缓存（设置页"清除数据"时一起清） */
export function clearAllSummaryCache(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith('qichi:summary:'))
    .forEach((k) => localStorage.removeItem(k));
}
