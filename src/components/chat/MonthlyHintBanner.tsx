'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMonthlyHint } from '@/hooks/useMonthlyHint';
import { ICONS } from '@/lib/assets';
import type { PetType } from '@/types';

interface Props {
  petName: string;
  petType: PetType;
}

/**
 * 聊天页顶部"去曲线看本月总结"的横向提示条。
 *
 * 出现时机由 useMonthlyHint 决定（当月 ≥5 条消息 + summary 未生成 + 用户未关闭）。
 * 关闭后本月不再出现；下月按新 key 自然重置。
 *
 * v2 GA：左侧加 28×28 装饰小图，按宠物切换（cat / dog 各一版）。
 */
export function MonthlyHintBanner({ petName, petType }: Props) {
  const { show, dismiss } = useMonthlyHint();
  if (!show) return null;

  const icon =
    petType === 'cat'
      ? ICONS.deco.monthlyHintCat
      : ICONS.deco.monthlyHintDog;

  return (
    <div className="mx-5 mb-2 flex animate-fade-in items-center gap-3 rounded-card bg-brand-pale px-4 py-3 text-caption text-ink">
      <Image
        src={icon}
        alt=""
        width={28}
        height={28}
        className="shrink-0"
      />
      <Link
        href="/curve"
        className="flex-1 hover:underline"
        aria-label="去曲线页看本月总结"
      >
        这个月你跟我说了不少。去看看{petName}给你写的总结？
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="本月不再提醒"
        className="-mt-0.5 shrink-0 text-ink-mute transition-colors hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
