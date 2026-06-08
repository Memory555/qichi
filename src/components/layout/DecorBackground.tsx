'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCurrentPet } from '@/hooks/useCurrentPet';
import { BACKGROUNDS, ICONS } from '@/lib/assets';
import { PETS } from '@/lib/pets';
import { BgImage } from './BgImage';

/**
 * 模块化背景装饰：根据当前路由 + 当前宠物，在内容层下方铺装饰。
 *
 * - 透明度 0.15-0.25，不抢内容
 * - 平移幅度 ±8px / 周期 9-16s，缓和不分心
 * - pointer-events: none，不挡点击
 * - z-0，所有 UI 在它上面
 */

type Theme = 'chat' | 'notebook' | 'curve' | 'me';

interface DecorItem {
  src: string;
  size: number;
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  opacity: number;
  rotate: number;
  duration: number;
  delay: number;
}

function getTheme(pathname: string): Theme {
  if (pathname.startsWith('/notebook')) return 'notebook';
  if (pathname.startsWith('/curve')) return 'curve';
  if (pathname.startsWith('/settings')) return 'me';
  return 'chat';
}

function getItems(theme: Theme, paws: readonly string[]): DecorItem[] {
  // 防御：如果 paws 数组为空（极端情况），直接返回云朵布局，免得后续 src 为空
  if (paws.length === 0) {
    return [
      { src: ICONS.deco.cloud1, size: 70, pos: { top: '8%', left: '6%' }, opacity: 0.2, rotate: 0, duration: 14, delay: 0 },
      { src: ICONS.deco.cloud2, size: 60, pos: { bottom: '20%', right: '8%' }, opacity: 0.2, rotate: 0, duration: 12, delay: 1 },
    ];
  }

  const p = (i: number) => paws[i % paws.length];

  switch (theme) {
    case 'chat':
      // 聊天：爪印散点 + 云朵，密度铺满整页（向参考图靠拢）
      return [
        // 顶部云层
        { src: ICONS.deco.cloud1, size: 80, pos: { top: '2%', left: '4%' }, opacity: 0.22, rotate: 0, duration: 14, delay: 0 },
        { src: ICONS.deco.cloud2, size: 70, pos: { top: '8%', right: '4%' }, opacity: 0.22, rotate: 0, duration: 16, delay: 1.2 },
        { src: ICONS.deco.cloud1, size: 50, pos: { top: '26%', right: '2%' }, opacity: 0.16, rotate: 0, duration: 13, delay: 0.5 },

        // 上半段爪印
        { src: p(0), size: 28, pos: { top: '32%', left: '5%' }, opacity: 0.28, rotate: -15, duration: 11, delay: 2 },
        { src: p(1), size: 22, pos: { top: '38%', left: '16%' }, opacity: 0.22, rotate: 25, duration: 9, delay: 0.8 },

        // 中段散布
        { src: p(2), size: 26, pos: { top: '46%', left: '22%' }, opacity: 0.24, rotate: -20, duration: 12, delay: 1.5 },
        { src: p(0), size: 30, pos: { top: '52%', right: '12%' }, opacity: 0.26, rotate: 30, duration: 10, delay: 0 },
        { src: p(1), size: 22, pos: { top: '60%', right: '22%' }, opacity: 0.22, rotate: -10, duration: 11, delay: 2.2 },
        { src: p(2), size: 24, pos: { top: '64%', left: '10%' }, opacity: 0.22, rotate: 18, duration: 12, delay: 1.8 },

        // 下半段
        { src: ICONS.deco.cloud2, size: 55, pos: { bottom: '24%', left: '2%' }, opacity: 0.18, rotate: 0, duration: 15, delay: 1 },
        { src: p(2), size: 28, pos: { bottom: '32%', left: '14%' }, opacity: 0.24, rotate: 5, duration: 12, delay: 1.5 },
        { src: p(0), size: 22, pos: { bottom: '38%', right: '8%' }, opacity: 0.22, rotate: -25, duration: 10, delay: 2.5 },
        { src: p(1), size: 26, pos: { bottom: '22%', right: '26%' }, opacity: 0.22, rotate: 15, duration: 11, delay: 0.3 },
        { src: p(0), size: 20, pos: { bottom: '14%', left: '36%' }, opacity: 0.18, rotate: 40, duration: 10, delay: 1.2 },
      ];

    case 'notebook':
      return [
        { src: ICONS.deco.cloud1, size: 70, pos: { top: '8%', right: '6%' }, opacity: 0.15, rotate: 0, duration: 14, delay: 0 },
        { src: p(0), size: 24, pos: { top: '38%', left: '4%' }, opacity: 0.15, rotate: 15, duration: 11, delay: 1 },
        { src: ICONS.deco.moonCrescent, size: 42, pos: { bottom: '22%', right: '6%' }, opacity: 0.18, rotate: -10, duration: 15, delay: 0.5 },
        { src: ICONS.deco.cloud2, size: 55, pos: { bottom: '10%', left: '8%' }, opacity: 0.15, rotate: 0, duration: 13, delay: 2 },
        { src: p(1), size: 22, pos: { top: '60%', right: '12%' }, opacity: 0.12, rotate: -20, duration: 10, delay: 1.5 },
      ];

    case 'curve':
      return [
        { src: ICONS.deco.cloud1, size: 60, pos: { top: '4%', left: '5%' }, opacity: 0.15, rotate: 0, duration: 14, delay: 0 },
        { src: ICONS.deco.moonFull, size: 55, pos: { top: '8%', right: '6%' }, opacity: 0.20, rotate: 0, duration: 12, delay: 1 },
        { src: ICONS.deco.moonCrescent, size: 38, pos: { bottom: '32%', left: '6%' }, opacity: 0.18, rotate: -15, duration: 13, delay: 0.5 },
        { src: ICONS.deco.cloud2, size: 65, pos: { bottom: '12%', right: '8%' }, opacity: 0.15, rotate: 0, duration: 11, delay: 2 },
      ];

    case 'me':
      return [
        { src: ICONS.deco.cloud1, size: 75, pos: { top: '6%', left: '6%' }, opacity: 0.18, rotate: 0, duration: 13, delay: 0 },
        { src: ICONS.deco.cloud2, size: 65, pos: { bottom: '20%', right: '8%' }, opacity: 0.18, rotate: 0, duration: 12, delay: 1 },
        { src: ICONS.deco.moonCrescent, size: 36, pos: { top: '45%', right: '6%' }, opacity: 0.15, rotate: 10, duration: 14, delay: 0.5 },
        { src: ICONS.deco.moonFull, size: 50, pos: { bottom: '10%', left: '12%' }, opacity: 0.15, rotate: 0, duration: 15, delay: 2 },
      ];
  }
}

export function DecorBackground() {
  const pathname = usePathname() ?? '/chat';
  const theme = getTheme(pathname);
  const { pet } = useCurrentPet();

  // 聊天页 / 设置页 用整页背景图（背景图自带云朵爪印氛围，关掉动画装饰避免叠加）
  if (theme === 'chat') return <BgImage src={BACKGROUNDS.chat} />;
  if (theme === 'me') return <BgImage src={BACKGROUNDS.settings} />;

  // 小本本 / 曲线 继续用动画装饰
  // 爪印路径从 PETS 表读（/simplify 重构后从 ICONS 移到 PETS[pet].paws）
  const paws = PETS[pet?.pet ?? 'cat'].paws;

  const items = getItems(theme, paws);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {items.map((it, i) => {
        // 防御：拿到空 src（资源缺失 / 配置错乱）就不渲染，避免 next/image 报错
        if (!it.src) return null;
        return (
          <div
            key={`${theme}-${i}`}
            className="animate-float absolute"
            style={{
              ...it.pos,
              opacity: it.opacity,
              ['--rot' as string]: `${it.rotate}deg`,
              ['--float-duration' as string]: `${it.duration}s`,
              ['--float-delay' as string]: `${it.delay}s`,
            } as React.CSSProperties}
          >
            <Image
              src={it.src}
              alt=""
              width={it.size}
              height={it.size}
              className="block select-none"
            />
          </div>
        );
      })}
    </div>
  );
}
