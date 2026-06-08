'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppBar } from '@/components/layout/AppBar';
import { Icon } from '@/components/ui/Icon';
import { PetStage } from '@/components/chat/PetStage';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useCurrentPet } from '@/hooks/useCurrentPet';
import { useMessages } from '@/hooks/useMessages';
import {
  addPetMessage,
  addUserMessage,
  setPetTranslation,
} from '@/lib/messages';
import { addEmotion } from '@/lib/emotions';
import { addReview } from '@/lib/reviews';
import { PETS } from '@/lib/pets';
import { pickRandomGreeting } from '@/lib/prompts';
import { ICONS } from '@/lib/assets';
import {
  translateMessage as clientTranslate,
  silentExtract as clientExtract,
  MissingLLMConfigError,
} from '@/lib/llm-client';
import { useRecentEmotion } from '@/hooks/useRecentEmotion';
import { useLLMConfig } from '@/hooks/useLLMConfig';
import type { PetPose } from '@/types';
import { resolvePetPose } from '@/types';

export default function ChatPage() {
  const { pet } = useCurrentPet();
  const messages = useMessages();
  const [translatingId, setTranslatingId] = useState<number | undefined>();
  const [failedId, setFailedId] = useState<number | undefined>();
  const [sending, setSending] = useState(false);

  const router = useRouter();
  const greeting = useMemo(() => pickRandomGreeting(), []);
  const recentEmotionScore = useRecentEmotion();
  const [isTyping, setIsTyping] = useState(false);
  const { config: llmConfig, configured: llmConfigured } = useLLMConfig();

  if (!pet) return null;
  const profile = PETS[pet.pet];

  // 姿态优先级：输入框正在输入 / 正在发送 → listen
  //              最近情绪分值 ≤ 3 → empathy
  //              其余 → idle
  const pose: PetPose = resolvePetPose({
    isUserTyping: isTyping || sending,
    recentEmotionScore,
  });

  const handleSend = async (text: string) => {
    if (sending) return;
    setSending(true);
    try {
      const userId = await addUserMessage(text);
      // 立即追加宠物气泡（仅原始叫声）
      await addPetMessage(profile.call);
      // 静默后台抽取：失败不抛错，不阻塞 UI
      void runSilentExtract(userId, text);
    } finally {
      setSending(false);
    }
  };

  /** 客户端直接调 LLM 抽取情绪 + NER，落本地 DB；无 key / 失败都静默 */
  async function runSilentExtract(messageId: number, text: string) {
    if (!llmConfigured) return; // 没填 key 直接跳过，不打扰
    try {
      const { emotion, ner } = await clientExtract(llmConfig, text);
      if (emotion) {
        await addEmotion({
          messageId,
          tags: emotion.tags,
          score: emotion.score,
          confidence: emotion.confidence,
          createdAt: Date.now(),
        });
      }
      if (ner) {
        await addReview({
          messageId,
          jobPosition: ner.jobPosition,
          company: ner.company,
          interviewStage: ner.interviewStage,
          questions: ner.questions ?? [],
          mistakes: ner.mistakes ?? [],
          strengths: ner.strengths ?? [],
          dateHint: ner.dateHint,
        });
      }
    } catch (e) {
      console.warn('[extract] silent fail', e);
    }
  }

  const handleTranslate = async (messageId: number) => {
    setFailedId(undefined);
    setTranslatingId(messageId);
    try {
      const idx = messages.findIndex((m) => m.id === messageId);
      const sourceUser = [...messages]
        .slice(0, idx)
        .reverse()
        .find((m) => m.role === 'user');
      if (!sourceUser) {
        setFailedId(messageId);
        return;
      }

      const translated = await clientTranslate(llmConfig, {
        userMessage: sourceUser.text,
        petType: pet.pet,
        petName: pet.name,
      });
      if (!translated) throw new Error('empty');
      await setPetTranslation(messageId, translated);
    } catch (e) {
      console.error('[translate] failed', e);
      if (e instanceof MissingLLMConfigError) {
        // 没填 key：跳转到设置页
        router.push('/settings#llm');
        return;
      }
      setFailedId(messageId);
    } finally {
      setTranslatingId(undefined);
    }
  };

  return (
    <>
      <AppBar
        left={
          <div className="flex items-center gap-2">
            <Icon src={profile.avatar} size={32} alt={pet.name} />
            <span className="text-h3 text-ink">{pet.name}</span>
          </div>
        }
        right={
          <Link
            href="/settings"
            aria-label="设置"
            className="flex h-8 w-8 items-center justify-center"
          >
            <Icon src={ICONS.action.filter} size={22} alt="设置" />
          </Link>
        }
      />

      {/* 顶部宠物形象区 */}
      <div className="pt-2">
        <PetStage pet={pet.pet} pose={pose} />
      </div>

      {/* 没配 key 的引导提示 */}
      {!llmConfigured && (
        <div className="mx-5 mb-2 rounded-card bg-brand-pale px-4 py-3 text-caption text-ink">
          想让 {pet.name} 跟你说人话？请先在{' '}
          <Link href="/settings#llm" className="text-brand underline">
            「我 → AI 配置」
          </Link>{' '}
          填好 API key。
        </div>
      )}

      {/* 对话气泡流 */}
      <MessageList
        messages={messages}
        onTranslate={handleTranslate}
        translatingId={translatingId}
        failedId={failedId}
        emptyPlaceholder={greeting}
      />

      {/* 输入区 */}
      <MessageInput
        placeholder={`跟${pet.name}说说...`}
        disabled={sending}
        onSend={handleSend}
        onTypingChange={setIsTyping}
      />
    </>
  );
}
