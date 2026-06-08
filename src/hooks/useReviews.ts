'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Review } from '@/lib/db';

/**
 * 取复盘卡片。
 * @param includeHidden true 返回全部（含隐藏），用于「已隐藏视图」做恢复
 *                      false 仅返回可见
 */
export function useReviews(includeHidden = false): Review[] {
  return (
    useLiveQuery(
      async () => {
        const all = await db.reviews.orderBy('createdAt').reverse().toArray();
        return includeHidden ? all : all.filter((r) => !r.hidden);
      },
      [includeHidden],
      [],
    ) ?? []
  );
}
