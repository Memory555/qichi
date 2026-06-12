'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Interview } from '@/lib/db';

/**
 * 全量 interviews（按 scheduledAt 倒序）。
 * 给日历视图按月过滤用，前端聚合，省一层 hook。
 */
export function useInterviews(): Interview[] {
  return (
    useLiveQuery(
      async () => db.interviews.orderBy('scheduledAt').reverse().toArray(),
      [],
      [],
    ) ?? []
  );
}
