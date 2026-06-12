'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type EmotionTag, type Review } from '@/lib/db';

/**
 * 情绪卡片（按日聚合）。
 *
 * 与 useEmotionTimeline 的区别：
 * - useEmotionTimeline：给折线图用，关注 score 数值
 * - useEmotionDigest：给情绪卡片用，关注**主导情绪标签** + **当日聊天摘要**
 *
 * 不强制用户每日打卡 —— 数据全部从已抽取的情绪记录聚合。
 */

/** 一个"事件"压扁成显示用的卡片 chip */
export interface EmotionEvent {
  reviewId: number;
  company?: string;
  jobPosition?: string;
  interviewStage?: string;
}

export interface EmotionDigest {
  /** 本地日期 YYYY-MM-DD */
  date: string;
  /** YYYY.M.D 短显示 */
  label: string;
  /** 当日出现频率最高的情绪标签（用于配色 / 主基调） */
  topTag: EmotionTag;
  /** 当日所有出现过的情绪标签（排重） */
  allTags: EmotionTag[];
  /** 当日平均分 0-10 */
  avgScore: number;
  /** 当日记录数 */
  count: number;
  /** 当日第一条 user 消息的前 60 字作为摘要 */
  excerpt?: string;
  /**
   * 当日关联到的"事件"（从 reviews 拿）。
   * 卡片会用这些 chip 让用户看到"那天我面了谁"。
   * hidden 的 review 不计入。
   */
  events: EmotionEvent[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalISODate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toShortLabel = (iso: string) => {
  const [yyyy, mm, dd] = iso.split('-');
  return `${Number(yyyy)}.${Number(mm)}.${Number(dd)}`;
};
const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) + '…' : s;

/**
 * @param days 0=全部，其他=最近 N 天
 * @param limit 最多返回多少张卡片（按日期倒序）。传 0 表示不限。
 */
export function useEmotionDigest(days = 30, limit = 30): EmotionDigest[] {
  return (
    useLiveQuery(
      async () => {
        const since = days > 0 ? Date.now() - days * DAY_MS : 0;
        const rows = await db.emotions
          .where('createdAt')
          .above(since)
          .toArray();
        if (rows.length === 0) return [];

        // 涉及到的 messageId：用于拉摘要 + 拉关联的 review 事件
        const wantedMessageIds = new Set<number>();
        const byDay = new Map<
          string,
          {
            sum: number;
            count: number;
            tagCount: Map<EmotionTag, number>;
            firstMessageId?: number;
            firstTs: number;
            messageIds: Set<number>;
          }
        >();

        for (const e of rows) {
          const day = toLocalISODate(e.createdAt);
          let bucket = byDay.get(day);
          if (!bucket) {
            bucket = {
              sum: 0,
              count: 0,
              tagCount: new Map(),
              firstMessageId: undefined,
              firstTs: Number.POSITIVE_INFINITY,
              messageIds: new Set(),
            };
            byDay.set(day, bucket);
          }
          bucket.sum += e.score;
          bucket.count += 1;
          for (const t of e.tags) {
            bucket.tagCount.set(t, (bucket.tagCount.get(t) ?? 0) + 1);
          }
          if (e.messageId) {
            bucket.messageIds.add(e.messageId);
            wantedMessageIds.add(e.messageId);
          }
          if (e.createdAt < bucket.firstTs) {
            bucket.firstTs = e.createdAt;
            bucket.firstMessageId = e.messageId;
          }
        }

        // 一次性拉摘要（user message 文本）
        const messageTexts = new Map<number, string>();
        // 一次性拉同日关联事件（reviews，按 messageId 索引）
        const reviewsByMessageId = new Map<number, Review>();

        if (wantedMessageIds.size > 0) {
          const ids = Array.from(wantedMessageIds);
          const [msgs, reviews] = await Promise.all([
            db.messages.where('id').anyOf(ids).toArray(),
            db.reviews.where('messageId').anyOf(ids).toArray(),
          ]);
          for (const m of msgs) {
            if (m.role === 'user' && m.id !== undefined) {
              messageTexts.set(m.id, m.text);
            }
          }
          for (const r of reviews) {
            if (r.hidden) continue;
            // 一个 messageId 至多一条 review（业务约定）
            reviewsByMessageId.set(r.messageId, r);
          }
        }

        const digests: EmotionDigest[] = Array.from(byDay.entries()).map(
          ([date, b]) => {
            // 排出 topTag
            let topTag: EmotionTag = '平静';
            let max = -1;
            for (const [t, c] of b.tagCount) {
              if (c > max) {
                max = c;
                topTag = t;
              }
            }
            const allTags = Array.from(b.tagCount.keys());
            const excerptRaw = b.firstMessageId
              ? messageTexts.get(b.firstMessageId)
              : undefined;

            // 关联事件：从当日 messageIds → reviews，去重保序
            const seen = new Set<number>();
            const events: EmotionEvent[] = [];
            for (const mid of b.messageIds) {
              const r = reviewsByMessageId.get(mid);
              if (!r || r.id === undefined || seen.has(r.id)) continue;
              seen.add(r.id);
              // 全无信息的 review 跳过（避免出现空 chip）
              if (!r.company && !r.jobPosition && !r.interviewStage) continue;
              events.push({
                reviewId: r.id,
                company: r.company,
                jobPosition: r.jobPosition,
                interviewStage: r.interviewStage,
              });
            }

            return {
              date,
              label: toShortLabel(date),
              topTag,
              allTags,
              avgScore: Number((b.sum / b.count).toFixed(1)),
              count: b.count,
              excerpt: excerptRaw ? truncate(excerptRaw, 60) : undefined,
              events,
            };
          },
        );

        const sorted = digests.sort((a, b) => b.date.localeCompare(a.date));
        return limit > 0 ? sorted.slice(0, limit) : sorted;
      },
      [days, limit],
      [],
    ) ?? []
  );
}
