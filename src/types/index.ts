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
  Interview,
  Settings,
} from '@/lib/db';

export { EMOTION_TAGS } from '@/lib/db';

// ─── UI 状态类型 ───────────────────────────

export type ChatState = 'idle' | 'sending' | 'translating' | 'error';

/**
 * 宠物姿态
 *
 * 四态：sleep / idle / listen / empathy（均已绑定精灵图）。
 * - sleep:   聊天页默认静默态（宠物趴睡）
 * - idle:    宠物选择页 / 唤醒待机态
 * - listen:  用户正在输入
 * - empathy: 用户最近情绪低落
 */
export type PetPose = 'sleep' | 'idle' | 'listen' | 'empathy';

export type MoodColor = 'warm' | 'pink' | 'blue' | 'green' | 'purple';

// ─── 姿态状态机参数（可调）─────────────────

/**
 * 触发共情姿态的情绪分值阈值。
 * 0=极度低落，10=亢奋。≤ 此值 → empathy。
 */
export const EMPATHY_SCORE_THRESHOLD = 3;

// ─── 宠物姿态状态机 ────────────────────────

/**
 * 决定宠物当前应该显示哪个姿态（聊天页用）。
 *
 * 优先级：
 * 1. 用户正在输入（focus 或非空 input）→ listen
 * 2. 最近一条用户消息情绪分值 ≤ EMPATHY_SCORE_THRESHOLD → empathy
 * 3. 默认 → sleep（聊天页静默态：宠物趴睡，等你来叫醒它）
 *
 * 注：宠物选择页直接读 `profile.sprites.idle`，不走本函数。
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
  return 'sleep';
}
