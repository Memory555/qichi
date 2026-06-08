'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Settings } from '@/lib/db';

interface Result {
  /**
   * - undefined：DB 还在初始化 / 查询中（应显示 loading）
   * - null：查询完成但无宠物（应去引导页）
   * - Settings：当前选中的宠物
   */
  pet: Settings | null | undefined;
  loading: boolean;
}

/**
 * 响应式取当前宠物设置。
 *
 * ⚠️ 关键：查询函数把"无行"显式映射成 null，避免与 useLiveQuery
 * 的 "初始 undefined" 撞值，否则首次进入永远卡 loading。
 */
export function useCurrentPet(): Result {
  const pet = useLiveQuery(
    async (): Promise<Settings | null> => {
      const found = await db.settings.orderBy('id').first();
      return found ?? null;
    },
    [],
  );

  return {
    pet,
    loading: pet === undefined,
  };
}
