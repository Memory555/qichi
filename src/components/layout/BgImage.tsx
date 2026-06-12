'use client';

import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  src: string;
  /**
   * 深色专版图片。
   * - 传：dark 模式下直接切到这张（不再叠加 overlay）
   * - 不传：dark 模式 fallback 用半透明 page 覆盖层把浅色图压暗
   */
  srcDark?: string;
  /** 是否优先加载（welcome 页首屏可以开） */
  priority?: boolean;
  /**
   * 上盖一层奶白半透明，避免背景图颜色太重把字盖住。
   * 0 = 不盖（默认）；0.2-0.5 = 越来越柔
   */
  overlay?: number;
}

/**
 * 整页背景图：absolute inset-0 z-0，pointer-events: none。
 *
 * v2 GA：
 * - 传了 srcDark → 深色模式直接换图，无 overlay
 * - 未传 srcDark → 深色模式叠 ~55% page 覆盖层兜底
 */
export function BgImage({ src, srcDark, priority = false, overlay = 0 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const resolvedSrc = isDark && srcDark ? srcDark : src;
  const needFallbackDarkOverlay = isDark && !srcDark;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Image
        src={resolvedSrc}
        alt=""
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover"
        priority={priority}
        quality={80}
      />
      {overlay > 0 && (
        <div
          className="absolute inset-0 bg-page"
          style={{ opacity: overlay }}
        />
      )}
      {/* 无 dark 专图时的兜底覆盖层（仅欢迎页等场景生效） */}
      {needFallbackDarkOverlay && (
        <div className="absolute inset-0 bg-page opacity-[0.55]" />
      )}
    </div>
  );
}
