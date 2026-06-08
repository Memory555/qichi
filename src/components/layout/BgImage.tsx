'use client';

import Image from 'next/image';

interface Props {
  src: string;
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
 * 用 next/image fill + object-cover 自动撑满容器。
 */
export function BgImage({ src, priority = false, overlay = 0 }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Image
        src={src}
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
    </div>
  );
}
