/**
 * 栖迟 · 情绪记录写入封装
 */

import { db, type Emotion } from './db';

export async function addEmotion(
  e: Omit<Emotion, 'id'>,
): Promise<number> {
  return db.emotions.add(e);
}
