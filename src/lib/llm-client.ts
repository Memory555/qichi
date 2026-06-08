/**
 * 栖迟 · 客户端 LLM 调用层
 *
 * 走"用户自带 key"模式：直接在浏览器里调 OpenAI 兼容接口。
 * 设置页填好 key + baseUrl 后，所有 LLM 调用都从客户端发出，
 * 不再依赖任何后端（也意味着支持 next.js 静态导出打成 APK）。
 *
 * ⚠️ 安全说明：API key 仅存在用户本机 IndexedDB，不上传任何服务器。
 * 走的是 OpenAI SDK 的 `dangerouslyAllowBrowser`，对本地存储的 key 是安全的，
 * 但**绝不能把任何人的 key 硬编码进代码 / 仓库**。
 */

'use client';

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

// ─── 配置 ────────────────────────────────

export interface LLMClientConfig {
  apiKey: string;
  baseUrl?: string;
  modelMain?: string;
  modelFast?: string;
}

const DEFAULT_MODEL_MAIN = 'gpt-4o-mini';
const DEFAULT_MODEL_FAST = 'gpt-4o-mini';

/** 错误：用户没在设置页配 key */
export class MissingLLMConfigError extends Error {
  constructor() {
    super('请先在「我」→ 「AI 配置」里填好 API key');
    this.name = 'MissingLLMConfigError';
  }
}

function getClient(config: LLMClientConfig): OpenAI {
  if (!config.apiKey) throw new MissingLLMConfigError();
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
    dangerouslyAllowBrowser: true,
    timeout: 30 * 1000,
    maxRetries: 0,
  });
}

// ─── 通用调用 ─────────────────────────

interface CallOptions {
  system: string;
  userMessage: string;
  fewShot?: ReadonlyArray<FewShotExample>;
  maxTokens?: number;
  temperature?: number;
  model: string;
  jsonMode?: boolean;
}

async function callGPT(
  config: LLMClientConfig,
  opts: CallOptions,
): Promise<string> {
  const client = getClient(config);

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: opts.system },
  ];
  if (opts.fewShot) {
    for (const ex of opts.fewShot) {
      messages.push({ role: 'user', content: ex.user });
      messages.push({ role: 'assistant', content: ex.pet });
    }
  }
  messages.push({ role: 'user', content: opts.userMessage });

  const params: ChatCompletionCreateParamsNonStreaming = {
    model: opts.model,
    messages,
    max_tokens: opts.maxTokens ?? 200,
    temperature: opts.temperature ?? 0.7,
    ...(opts.jsonMode
      ? { response_format: { type: 'json_object' as const } }
      : {}),
  };

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 30_000);
  try {
    const response = await client.chat.completions.create(params, {
      signal: ac.signal,
    });
    const text = response.choices[0]?.message?.content ?? '';
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

// ─── P1 · 共情翻译 ────────────────────

export async function translateMessage(
  config: LLMClientConfig,
  opts: { userMessage: string; petType: PetType; petName: PetName },
): Promise<string> {
  const profile = PETS[opts.petType];
  return callGPT(config, {
    system: profile.buildSystemPrompt(opts.petName),
    userMessage: opts.userMessage,
    fewShot: profile.fewShot,
    maxTokens: 80,
    temperature: 0.85,
    model: config.modelMain ?? DEFAULT_MODEL_MAIN,
  });
}

// ─── P2 · 情绪 ─────────────────────────

export interface EmotionResult {
  tags: EmotionTag[];
  score: number;
  confidence: number;
}

export async function extractEmotion(
  config: LLMClientConfig,
  userMessage: string,
): Promise<EmotionResult> {
  try {
    const raw = await callGPT(config, {
      system: EMOTION_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 100,
      temperature: 0.2,
      model: config.modelFast ?? DEFAULT_MODEL_FAST,
      jsonMode: true,
    });
    return JSON.parse(raw) as EmotionResult;
  } catch {
    return { tags: ['平静'], score: 5, confidence: 0.3 };
  }
}

// ─── P3 · NER ─────────────────────────

export type NerResult = Omit<
  Review,
  'id' | 'messageId' | 'userEdited' | 'hidden' | 'createdAt'
> | null;

export async function extractInterviewInfo(
  config: LLMClientConfig,
  userMessage: string,
): Promise<NerResult> {
  try {
    const raw = await callGPT(config, {
      system: NER_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 300,
      temperature: 0.1,
      model: config.modelFast ?? DEFAULT_MODEL_FAST,
      jsonMode: true,
    });
    if (!raw || raw === 'null') return null;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed.result === null) return null;
    return parsed as NerResult;
  } catch {
    return null;
  }
}

/** 并行抽取：失败不抛错 */
export async function silentExtract(
  config: LLMClientConfig,
  userMessage: string,
) {
  if (!config.apiKey) return { emotion: null, ner: null };
  const [emotion, ner] = await Promise.all([
    extractEmotion(config, userMessage),
    extractInterviewInfo(config, userMessage),
  ]);
  return { emotion, ner };
}

// ─── P5 · 月度总结 ────────────────────

export interface MonthlySummaryInput {
  petType: PetType;
  petName: PetName;
  emotionTimeline: string;
  interviewDigest: string;
  totalDays: number;
  totalMessages: number;
}

export async function generateMonthlySummary(
  config: LLMClientConfig,
  input: MonthlySummaryInput,
): Promise<string> {
  const system = buildMonthlySummaryPrompt(input.petName, input.petType);
  const userPayload = [
    `情绪时间线：${input.emotionTimeline}`,
    `面试记录：${input.interviewDigest}`,
    `聊天天数：${input.totalDays} 天，发言 ${input.totalMessages} 条`,
  ].join('\n');

  try {
    return await callGPT(config, {
      system,
      userMessage: userPayload,
      maxTokens: 300,
      temperature: 0.65,
      model: config.modelMain ?? DEFAULT_MODEL_MAIN,
    });
  } catch {
    return `这个月你来了 ${input.totalDays} 天，${input.totalMessages} 次聊到事情。我都在。`;
  }
}

// ─── 测试连接（设置页用） ────────────

export async function pingLLM(config: LLMClientConfig): Promise<string> {
  return callGPT(config, {
    system: '你是一个测试助手，用一句话简短回答。',
    userMessage: '说"你好"',
    maxTokens: 20,
    temperature: 0.3,
    model: config.modelFast ?? DEFAULT_MODEL_FAST,
  });
}
