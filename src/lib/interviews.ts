/**
 * 栖迟 · 面试日程读写封装（v2.1 新增）
 *
 * 与 lib/reviews.ts 的区别：
 * - reviews：已发生 + AI 自动抽取（来自 messages）
 * - interviews：计划/未来 + 用户主动添加（独立来源）
 */

import { db, type Interview } from './db';

export type NewInterview = Omit<
  Interview,
  'id' | 'createdAt' | 'completedAt'
>;

export async function addInterview(fields: NewInterview): Promise<number> {
  return db.interviews.add({
    ...fields,
    createdAt: Date.now(),
  });
}

export async function updateInterview(
  id: number,
  patch: Partial<Omit<Interview, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.interviews.update(id, patch);
}

export async function deleteInterview(id: number): Promise<void> {
  await db.interviews.delete(id);
}

/** 标记完成 / 取消完成 */
export async function toggleInterviewDone(
  id: number,
  done: boolean,
): Promise<void> {
  await db.interviews.update(id, {
    completedAt: done ? Date.now() : undefined,
  });
}
