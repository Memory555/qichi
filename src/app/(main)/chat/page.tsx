'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
import { useRecentEmotion } from '@/hooks/useRecentEmotion';
import type { PetPose } from '@/types';
import { resolvePetPose } from '@/types';

export default function ChatPage() {
  const { pet } = useCurrentPet();
  const messages = useMessages();
  const [translatingId, setTranslatingId] = useState<number | undefined>();
  const [failedId, setFailedId] = useState<number | undefined>();
  const [sending, setSending] = useState(false);

  const greeting = useMemo(() => pickRandomGreeting(), []);
  const recentEmotionScore = useRecentEmotion();
  const [isTyping, setIsTyping] = useState(false);

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

  /** 调 /api/extract → 把情绪标签 + 面试要素落到本地 DB */
  async function runSilentExtract(messageId: number, text: string) {
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        console.warn('[extract] non-200', res.status);
        return;
      }
      const data = (await res.json()) as {
        emotion?: {
          tags: string[];
          score: number;
          confidence: number;
        };
        ner?: {
          jobPosition?: string;
          company?: string;
          interviewStage?: string;
          questions?: string[];
          mistakes?: string[];
          strengths?: string[];
          dateHint?: string;
        } | null;
      };

      if (data.emotion) {
        await addEmotion({
          messageId,
          tags: data.emotion.tags as never,
          score: data.emotion.score,
          confidence: data.emotion.confidence,
          createdAt: Date.now(),
        });
      }
      if (data.ner) {
        await addReview({
          messageId,
          jobPosition: data.ner.jobPosition,
          company: data.ner.company,
          interviewStage: data.ner.interviewStage,
          questions: data.ner.questions ?? [],
          mistakes: data.ner.mistakes ?? [],
          strengths: data.ner.strengths ?? [],
          dateHint: data.ner.dateHint,
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
      // 找到这条 pet 消息对应的"上一条 user 消息"作为翻译来源
      const idx = messages.findIndex((m) => m.id === messageId);
      const sourceUser = [...messages]
        .slice(0, idx)
        .reverse()
        .find((m) => m.role === 'user');
      if (!sourceUser) {
        setFailedId(messageId);
        return;
      }

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceUser.text,
          petType: pet.pet,
          petName: pet.name,
        }),
      });
      if (!res.ok) {
        // 解析错误体，把后端真实错误吐到 console
        const errBody = await res.json().catch(() => ({}));
        console.error('[translate] server error', {
          status: res.status,
          ...errBody,
        });
        throw new Error(
          `HTTP ${res.status}${errBody.detail ? `: ${errBody.detail}` : ''}`,
        );
      }
      const data = (await res.json()) as { translated?: string };
      if (!data.translated) throw new Error('empty');
      await setPetTranslation(messageId, data.translated);
    } catch (e) {
      console.error('[translate] failed', e);
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
