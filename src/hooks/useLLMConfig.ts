'use client';

import { useCurrentPet } from './useCurrentPet';
import type { LLMClientConfig } from '@/lib/llm-client';

interface Result {
  config: LLMClientConfig;
  /** 是否已经填好 apiKey */
  configured: boolean;
}

/**
 * 从 settings 表里读 LLM 配置。
 * 未配置时 config.apiKey 为空字符串，调用 llm-client 会抛 MissingLLMConfigError。
 */
export function useLLMConfig(): Result {
  const { pet } = useCurrentPet();
  const config: LLMClientConfig = {
    apiKey: pet?.openaiKey ?? '',
    baseUrl: pet?.openaiBaseUrl,
    modelMain: pet?.openaiModelMain,
    modelFast: pet?.openaiModelFast,
  };
  return { config, configured: !!config.apiKey };
}
