/**
 * 栖迟 · 复盘记录读写封装
 *
 * 设计语义：
 * - 隐藏（hide）：用户认为这条不该出现在小本本，但情绪记录本身真实，保留在曲线
 * - 删除（delete）：用户认为整段事件不真实/不要了，**级联**删掉同 messageId 的情绪
 */

import { db, type Review } from './db';

/** 后台抽取得到 NER 结果时写入 */
export async function addReview(
  fields: Omit<Review, 'id' | 'userEdited' | 'hidden' | 'createdAt'>,
): Promise<number> {
  return db.reviews.add({
    ...fields,
    userEdited: false,
    hidden: false,
    createdAt: Date.now(),
  });
}

export async function setReviewHidden(
  id: number,
  hidden: boolean,
): Promise<void> {
  await db.reviews.update(id, { hidden });
}

/**
 * 删除复盘卡片 + 级联删除同源情绪记录。
 *
 * 同源指 messageId 相同 —— 因为一次用户消息至多产生 1 条情绪 + 1 条复盘，
 * 它们共享 messageId。删复盘 = 否定整段事件，曲线对应那个点也应消失。
 *
 * 特殊情况：messageId === 0（种子数据 / 旧数据）不级联，免误伤其他记录。
 */
export async function deleteReview(id: number): Promise<void> {
  const review = await db.reviews.get(id);
  if (!review) return;

  await db.transaction('rw', [db.reviews, db.emotions], async () => {
    if (review.messageId > 0) {
      await db.emotions
        .where('messageId')
        .equals(review.messageId)
        .delete();
    }
    await db.reviews.delete(id);
  });
}

export async function updateReview(
  id: number,
  patch: Partial<Review>,
): Promise<void> {
  await db.reviews.update(id, { ...patch, userEdited: true });
}
