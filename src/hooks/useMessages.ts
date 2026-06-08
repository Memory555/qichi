'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Message } from '@/lib/db';

/** 实时按时间升序拉取对话历史 */
export function useMessages(): Message[] {
  return (
    useLiveQuery(
      () => db.messages.orderBy('createdAt').toArray(),
      [],
      [],
    ) ?? []
  );
}
