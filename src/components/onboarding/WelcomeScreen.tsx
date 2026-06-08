'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { BgImage } from '@/components/layout/BgImage';
import { BACKGROUNDS, BRAND } from '@/lib/assets';

interface Props {
  onContinue: () => void;
}

/**
 * 欢迎屏：背景图（猫狗双陪伴插画 + 装饰）在底层，
 * 顶部是「栖迟」艺术字 + 诗经引用，
 * 底部是 tagline + 进入按钮 + 隐私小字。
 *
 * 中间留白让背景图的猫狗有呼吸感，不被文字盖住。
 */
export function WelcomeScreen({ onContinue }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center px-6 pt-8 pb-12 text-center">
      <BgImage src={BACKGROUNDS.welcome} priority />

      {/* 顶部：栖迟艺术字 + 诗经引用 */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="relative h-32 w-60">
          <Image
            src={BRAND.wordmark}
            alt="栖迟"
            fill
            sizes="240px"
            priority
            className="object-contain"
          />
        </div>
        <p
          className="text-caption text-ink-mute"
          style={{ fontFamily: 'serif' }}
        >
          衡门之下，可以栖迟。 —— 《诗经·陈风·衡门》
        </p>
      </div>

      {/* 中部：留白让背景图的猫狗插画自然呼吸 */}
      <div className="flex-1" />

      {/* 底部：tagline + CTA + 隐私 */}
      <div className="relative z-10 flex w-full flex-col items-center gap-3">
        <p className="mb-3 text-body-em font-light leading-relaxed text-ink">
          给求职路上的人一个暂时停靠的地方
        </p>
        <Button size="lg" onClick={onContinue} className="w-48">
          进来坐坐
        </Button>
        <p className="text-mini text-ink-mute">
          数据只保存在你自己的设备上
        </p>
      </div>
    </div>
  );
}
