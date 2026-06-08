'use client';

/**
 * 粒子层：22 个微小暖色光点缓慢上升 + 微微左右漂移，
 * 像阳光里的尘埃。
 *
 * - 全部用 CSS animation，无 JS 计算，GPU 加速
 * - 透明度 0.2-0.4 极轻，几乎不被察觉但能感受到空气在流动
 * - 位置 / 大小 / 速度全部确定性生成，SSR 友好（不会 hydration mismatch）
 */

interface Particle {
  left: number; // %
  bottom: number; // 起始 % from bottom（粒子从下半屏开始上升）
  size: number; // px
  duration: number; // s
  delay: number; // s
  drift: number; // px 水平漂移
  color: string;
  opacity: number;
}

const COUNT = 22;
const COLORS = ['#F5A65B', '#E8893A', '#FCD9A8', '#FFD6CC'];

/** 确定性 PRNG，保证 SSR / 客户端渲染一致 */
function seeded(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES: Particle[] = Array.from({ length: COUNT }, (_, i) => ({
  left: seeded(i, 1) * 100,
  bottom: -10 + seeded(i, 2) * 40, // 从底部 -10% 到 30% 之间起步
  size: 2 + Math.floor(seeded(i, 3) * 4), // 2-5 px
  duration: 14 + seeded(i, 4) * 10, // 14-24 s
  delay: seeded(i, 5) * 18, // 0-18 s
  drift: (seeded(i, 6) - 0.5) * 60, // -30 ~ +30 px
  color: COLORS[Math.floor(seeded(i, 7) * COLORS.length)],
  opacity: 0.2 + seeded(i, 8) * 0.2, // 0.2-0.4
}));

export function Particles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-particle absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            ['--particle-duration' as string]: `${p.duration}s`,
            ['--particle-delay' as string]: `${p.delay}s`,
            ['--particle-drift' as string]: `${p.drift}px`,
            ['--particle-opacity' as string]: `${p.opacity}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
