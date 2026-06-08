/**
 * 栖迟 · 本地数据库（IndexedDB via Dexie）
 *
 * 4 张表：
 * - messages：对话条目
 * - emotions：情绪记录（每条 user 消息可能对应 1 条）
 * - reviews：复盘抽取（每条 user 消息可能对应 1 条或 0 条）
 * - settings：单行用户设置
 */

import Dexie, { type Table } from 'dexie';

// ─── 类型定义 ───────────────────────────────

export type PetType = 'cat' | 'dog';
export type PetName = '栖栖' | '迟迟';

// 单一情绪标签来源：const 数组 → 派生类型，杜绝同步漂移
export const EMOTION_TAGS = [
  '焦虑',
  '挫败',
  '侥幸',
  '兴奋',
  '自我否定',
  '迷茫',
  '平静',
  '麻木',
] as const;

export type EmotionTag = (typeof EMOTION_TAGS)[number];

export type MessageRole = 'user' | 'pet';

export interface Message {
  id?: number;
  role: MessageRole;
  /** 显示文本（user 是原文；pet 默认是"喵～/汪～"） */
  text: string;
  /** 翻译后人话（仅 pet）；为空表示用户还没点翻译 */
  translatedText?: string;
  createdAt: number;
}

export interface Emotion {
  id?: number;
  messageId: number;
  tags: EmotionTag[];
  /** 0-10，0=极度低落，5=平稳，10=亢奋 */
  score: number;
  /** 0-1，LLM 自评置信度 */
  confidence: number;
  createdAt: number;
}

export interface Review {
  id?: number;
  messageId: number;
  jobPosition?: string;
  company?: string;
  interviewStage?: string;
  questions: string[];
  mistakes: string[];
  strengths: string[];
  dateHint?: string;
  /** 用户编辑过则为 true，可与原始抽取做对比 */
  userEdited: boolean;
  /** 用户点"这条不算"则为 true，从小本本主流中隐藏 */
  hidden: boolean;
  createdAt: number;
}

export interface Settings {
  id?: number;
  pet: PetType;
  name: PetName;
  createdAt: number;
  /** 用户自带 OpenAI 兼容 API key（仅存本机 IndexedDB，不上传） */
  openaiKey?: string;
  /** OpenAI 兼容代理地址（如 https://api.chatanywhere.tech/v1），留空走官方 */
  openaiBaseUrl?: string;
  /** 主力模型，默认 gpt-4o-mini */
  openaiModelMain?: string;
  /** 快速模型（情绪/NER 抽取用），默认 gpt-4o-mini */
  openaiModelFast?: string;
}

export type LLMConfigPatch = Partial<
  Pick<
    Settings,
    'openaiKey' | 'openaiBaseUrl' | 'openaiModelMain' | 'openaiModelFast'
  >
>;

// ─── 数据库 ─────────────────────────────────

class QiChiDB extends Dexie {
  messages!: Table<Message, number>;
  emotions!: Table<Emotion, number>;
  reviews!: Table<Review, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('qichi');
    this.version(1).stores({
      // 索引说明：
      // ++id：自增主键
      // 普通字段：可被 .where() 查询
      // *tags：多值索引（数组中任一值都能命中）
      messages: '++id, role, createdAt',
      emotions: '++id, messageId, createdAt, *tags',
      reviews: '++id, messageId, company, jobPosition, hidden, createdAt',
      settings: '++id',
    });
  }
}

export const db = new QiChiDB();

// ─── 便捷查询封装 ─────────────────────────────

export async function getCurrentPet(): Promise<Settings | undefined> {
  return db.settings.orderBy('id').first();
}

/** 部分更新当前 settings 行的 LLM 字段 */
export async function updateLLMConfig(patch: LLMConfigPatch): Promise<void> {
  const current = await db.settings.orderBy('id').first();
  if (!current?.id) return;
  await db.settings.update(current.id, patch);
}

export async function setCurrentPet(pet: PetType): Promise<void> {
  // 动态 import 避免 db ↔ pets 循环
  const { PETS } = await import('./pets');
  await db.transaction('rw', db.settings, async () => {
    await db.settings.clear();
    await db.settings.add({
      pet,
      name: PETS[pet].name,
      createdAt: Date.now(),
    });
  });
}

export async function resetAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.messages, db.emotions, db.reviews, db.settings],
    async () => {
      await db.messages.clear();
      await db.emotions.clear();
      await db.reviews.clear();
      await db.settings.clear();
    },
  );
}

/**
 * 导出全部数据为可读 JSON。
 *
 * 上层是按日期组织的"人话"视图（对话历史 + 复盘 + 情绪），
 * 底部 _原始数据 保留 4 张表的原貌，将来可用于备份恢复。
 */
export async function exportAllData() {
  const [messages, emotions, reviews, settings] = await Promise.all([
    db.messages.orderBy('createdAt').toArray(),
    db.emotions.orderBy('createdAt').toArray(),
    db.reviews.orderBy('createdAt').toArray(),
    db.settings.toArray(),
  ]);

  const pet = settings[0];
  const petName = pet?.name ?? '宠物';
  const petTypeStr = pet?.pet === 'cat' ? '橘猫' : pet?.pet === 'dog' ? '柴犬' : '?';

  const pad = (n: number) => String(n).padStart(2, '0');
  const dayKey = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const dateTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const timeOnly = (ts: number) => {
    const d = new Date(ts);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // ─── 对话历史：按日期分组 + 翻译并行显示 ───
  const conversationsByDay = new Map<
    string,
    Array<Record<string, string | undefined>>
  >();
  for (const m of messages) {
    const day = dayKey(m.createdAt);
    const arr = conversationsByDay.get(day) ?? [];
    if (m.role === 'user') {
      arr.push({ 时间: timeOnly(m.createdAt), 我说: m.text });
    } else {
      const entry: Record<string, string | undefined> = {
        时间: timeOnly(m.createdAt),
        [`${petName}说`]: m.text,
      };
      if (m.translatedText) {
        entry[`${petName}的人话`] = m.translatedText;
      }
      arr.push(entry);
    }
    conversationsByDay.set(day, arr);
  }
  const 对话历史 = Array.from(conversationsByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([日期, 当日条目]) => ({ 日期, 当日条目 }));

  // ─── 复盘卡片 ───
  const 复盘卡片 = reviews.map((r) => ({
    日期: dayKey(r.createdAt),
    公司: r.company ?? null,
    岗位: r.jobPosition ?? null,
    轮次: r.interviewStage ?? null,
    被问到的: r.questions,
    卡住的点: r.mistakes,
    答得不错: r.strengths,
    已隐藏: r.hidden,
    用户编辑过: r.userEdited,
  }));

  // ─── 情绪记录 ───
  const 情绪记录 = emotions.map((e) => ({
    时间: dateTime(e.createdAt),
    标签: e.tags,
    分值: e.score,
    可信度: e.confidence,
  }));

  // ─── 数据概览（开头一眼看清范围）───
  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const petMsgCount = messages.filter((m) => m.role === 'pet').length;
  const translatedCount = messages.filter(
    (m) => m.role === 'pet' && m.translatedText,
  ).length;

  return {
    导出时间: new Date().toISOString(),
    宠物: pet ? `${petName}（${petTypeStr}）` : '未选',
    数据概览: {
      跨越天数: conversationsByDay.size,
      消息总数: messages.length,
      用户消息: userMsgCount,
      宠物消息: petMsgCount,
      其中已点过翻译: translatedCount,
      复盘卡片: reviews.length,
      其中已隐藏: reviews.filter((r) => r.hidden).length,
      情绪记录: emotions.length,
    },
    对话历史,
    复盘卡片,
    情绪记录,
    _原始数据: {
      messages,
      emotions,
      reviews,
      settings,
    },
  };
}
