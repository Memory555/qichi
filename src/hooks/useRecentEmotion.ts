'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

/**
 * 取最近 N 毫秒内最新一条情绪记录的分值。
 * 用于驱动宠物姿态切换（empathy 触发条件）。
 *
 * 默认 5 分钟内 —— 超过这段时间认为情绪窗口已"翻篇"，宠物回 idle。
 */
export function useRecentEmotion(withinMs = 5 * 60 * 1000): number | undefined {
  return useLiveQuery(
    async () => {
      const since = Date.now() - withinMs;
      const latest = await db.emotions
        .where('createdAt')
        .above(since)
        .reverse()
        .limit(1)
        .first();
      return latest?.score;
    },
    [withinMs],
    undefined,
  );
}
