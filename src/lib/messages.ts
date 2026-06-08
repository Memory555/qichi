/**
 * 栖迟 · 消息读写封装
 *
 * 客户端使用：从 UI 层调用本文件的函数，不直接 db.messages.add(...)
 */

import { db, type Message } from './db';

/** 用户发送一条消息 */
export async function addUserMessage(text: string): Promise<number> {
  return db.messages.add({
    role: 'user',
    text: text.trim(),
    createdAt: Date.now(),
  });
}

/** 宠物回复：先只存"喵～/汪～"，翻译延迟填充 */
export async function addPetMessage(rawCall: string): Promise<number> {
  return db.messages.add({
    role: 'pet',
    text: rawCall,
    createdAt: Date.now(),
  });
}

/** 翻译完成后回填到原宠物消息 */
export async function setPetTranslation(
  messageId: number,
  translatedText: string,
): Promise<void> {
  await db.messages.update(messageId, { translatedText });
}

/** 获取单条（用于 API 调用前的取值等） */
export async function getMessage(id: number): Promise<Message | undefined> {
  return db.messages.get(id);
}
