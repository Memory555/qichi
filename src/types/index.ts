/**
 * 栖迟 · 共享类型 + UI 状态机
 *
 * 这里只放：
 *   1. 从 lib/db 透传出去的领域类型（让组件不直接 import db）
 *   2. 纯 UI 状态类型（不涉及 IndexedDB）
 *   3. 与姿态/情绪相关的小型行为函数
 */

export type {
  PetType,
  PetName,
  EmotionTag,
  MessageRole,
  Message,
  Emotion,
  Review,
  Settings,
} from '@/lib/db';

export { EMOTION_TAGS } from '@/lib/db';

// ─── UI 状态类型 ───────────────────────────

export type ChatState = 'idle' | 'sending' | 'translating' | 'error';

/**
 * 宠物姿态
 *
 * MVP 三态：idle / listen / empathy（对应已绑定的精灵图）。
 * "趴睡" 精灵图 PNG 保留在 public/pets/，但不进入类型/状态机；
 * 启用夜间模式时再扩展此 union 与 PETS 表。
 */
export type PetPose = 'idle' | 'listen' | 'empathy';

export type MoodColor = 'warm' | 'pink' | 'blue' | 'green' | 'purple';

// ─── 姿态状态机参数（可调）─────────────────

/**
 * 触发共情姿态的情绪分值阈值。
 * 0=极度低落，10=亢奋。≤ 此值 → empathy。
 */
export const EMPATHY_SCORE_THRESHOLD = 3;

// ─── 宠物姿态状态机 ────────────────────────

/**
 * 决定宠物当前应该显示哪个姿态。
 *
 * 优先级：
 * 1. 用户正在输入（focus 或非空 input）→ listen
 * 2. 最近一条用户消息情绪分值 ≤ EMPATHY_SCORE_THRESHOLD → empathy
 * 3. 默认 → idle
 */
export function resolvePetPose(opts: {
  isUserTyping: boolean;
  recentEmotionScore?: number;
}): PetPose {
  if (opts.isUserTyping) return 'listen';
  if (
    opts.recentEmotionScore !== undefined &&
    opts.recentEmotionScore <= EMPATHY_SCORE_THRESHOLD
  ) {
    return 'empathy';
  }
  return 'idle';
}
