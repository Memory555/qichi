/**
 * 栖迟 · LLM 调用封装（服务端使用，OpenAI 格式）
 *
 * ⚠️ 重要：请从 Next.js API Route 调用本文件的函数，
 *    不要直接在前端 import。OPENAI_API_KEY 必须留在服务端。
 *
 * 客户端使用方式：
 *   const res = await fetch('/api/translate', { method: 'POST', body: ... });
 *
 * 模型选择：
 *   - MODEL_MAIN（默认 gpt-4o）：P1 共情翻译 + P5 月度总结
 *   - MODEL_FAST（默认 gpt-4o-mini）：P2 情绪 + P3 NER
 *
 * 也可通过环境变量切换到其他 OpenAI 兼容模型 / 代理（Azure / OpenRouter / 自建网关）。
 */

import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources/chat/completions';
import type { PetType, PetName, EmotionTag, Review } from './db';
import {
  EMOTION_SYSTEM_PROMPT,
  NER_SYSTEM_PROMPT,
  buildMonthlySummaryPrompt,
  type FewShotExample,
} from './prompts';
import { PETS } from './pets';

// ─── 客户端单例 ─────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  // 如使用 OpenAI 兼容代理（Azure / OpenRouter / 自建网关），设置 baseURL：
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  // 默认 SDK 超时是 10 分钟，对免费代理不友好；卡 30 秒就放弃
  timeout: 30 * 1000,
  // SDK 默认 2 次重试，免费代理慢时翻倍，降到 0 让前端能快速进失败态重试
  maxRetries: 0,
});

const MODEL_MAIN = process.env.OPENAI_MODEL_MAIN ?? 'gpt-4o';
const MODEL_FAST = process.env.OPENAI_MODEL_FAST ?? 'gpt-4o-mini';

// ─── 通用调用 ─────────────────────────────

interface CallOptions {
  system: string;
  userMessage: string;
  fewShot?: ReadonlyArray<FewShotExample>;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  jsonMode?: boolean;
}

async function callGPT({
  system,
  userMessage,
  fewShot,
  maxTokens = 200,
  temperature = 0.7,
  model = MODEL_MAIN,
  jsonMode = false,
}: CallOptions): Promise<string> {
  // OpenAI JSON mode 要求 system 中含 "JSON" 字样；EMOTION/NER prompt 内已含"JSON"，
  // 不再额外注入避免重复。如果未来新增 jsonMode 调用且 system 不含 "JSON"，
  // 在那个 prompt 模板里补 1 个词即可。
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
  ];

  // Few-shot 示例：以 user / assistant 交替注入
  if (fewShot) {
    for (const ex of fewShot) {
      messages.push({ role: 'user', content: ex.user });
      messages.push({ role: 'assistant', content: ex.pet });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  const params: ChatCompletionCreateParamsNonStreaming = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    ...(jsonMode
      ? { response_format: { type: 'json_object' as const } }
      : {}),
  };

  // 用 AbortController 强制 30 秒超时（SDK 自身的 timeout 在某些代理下不生效）
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 30_000);
  try {
    const response = await openai.chat.completions.create(params, {
      signal: ac.signal,
    });
    const text = response.choices[0]?.message?.content ?? '';
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

// ─── P1 · 共情翻译 ────────────────────────

export async function translateMessage(opts: {
  userMessage: string;
  petType: PetType;
  petName: PetName;
}): Promise<string> {
  const profile = PETS[opts.petType];
  return callGPT({
    system: profile.buildSystemPrompt(opts.petName),
    userMessage: opts.userMessage,
    // 默认带 few-shot：3 个共情示例引导 GPT 抓住人设。
    // 仅在免费代理跑不动 long context 时，可设 LLM_DISABLE_FEWSHOT=true 关掉。
    fewShot:
      process.env.LLM_DISABLE_FEWSHOT === 'true' ? undefined : profile.fewShot,
    maxTokens: 80,
    temperature: 0.85, // 略提升，避免每次都"我陪你"模板化
  });
}

// ─── P2 · 情绪标签 ────────────────────────

export interface EmotionResult {
  tags: EmotionTag[];
  score: number;
  confidence: number;
}

export async function extractEmotion(
  userMessage: string,
): Promise<EmotionResult> {
  try {
    const raw = await callGPT({
      system: EMOTION_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 100,
      temperature: 0.2,
      model: MODEL_FAST,
      jsonMode: true,
    });
    return JSON.parse(raw) as EmotionResult;
  } catch (e) {
    // 失败兜底：返回平静
    return { tags: ['平静'], score: 5, confidence: 0.3 };
  }
}

// ─── P3 · 面试要素抽取 ────────────────────

export type NerResult = Omit<
  Review,
  'id' | 'messageId' | 'userEdited' | 'hidden' | 'createdAt'
> | null;

export async function extractInterviewInfo(
  userMessage: string,
): Promise<NerResult> {
  try {
    const raw = await callGPT({
      system: NER_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 300,
      temperature: 0.1,
      model: MODEL_FAST,
      jsonMode: true,
    });
    if (!raw || raw === 'null') return null;
    const parsed = JSON.parse(raw);
    // 处理 GPT 把结果包成 { result: null } 的情况
    if (parsed === null || parsed.result === null) return null;
    return parsed as NerResult;
  } catch (e) {
    return null;
  }
}

// ─── P5 · 月度总结 ────────────────────────

export interface MonthlySummaryInput {
  petType: PetType;
  petName: PetName;
  emotionTimeline: string;
  interviewDigest: string;
  totalDays: number;
  totalMessages: number;
}

export async function generateMonthlySummary(
  input: MonthlySummaryInput,
): Promise<string> {
  const system = buildMonthlySummaryPrompt(input.petName, input.petType);
  const userPayload = [
    `情绪时间线：${input.emotionTimeline}`,
    `面试记录：${input.interviewDigest}`,
    `聊天天数：${input.totalDays} 天，发言 ${input.totalMessages} 条`,
  ].join('\n');

  try {
    return await callGPT({
      system,
      userMessage: userPayload,
      maxTokens: 300,
      temperature: 0.65,
    });
  } catch (e) {
    return `这个月你来了 ${input.totalDays} 天，${input.totalMessages} 次聊到事情。我都在。`;
  }
}

// ─── 并行处理：用户每发一条消息触发 ─────────

/**
 * 用户发送消息后并行触发 P2 + P3 静默抽取
 * 不阻塞前端，失败也不抛错
 */
export async function silentExtract(userMessage: string) {
  const [emotion, ner] = await Promise.all([
    extractEmotion(userMessage),
    extractInterviewInfo(userMessage),
  ]);
  return { emotion, ner };
}
