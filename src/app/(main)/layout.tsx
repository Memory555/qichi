'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { TabBar } from '@/components/layout/TabBar';
import { DecorBackground } from '@/components/layout/DecorBackground';
import { Particles } from '@/components/layout/Particles';
import { useCurrentPet } from '@/hooks/useCurrentPet';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { pet, loading } = useCurrentPet();

  useEffect(() => {
    if (!loading && !pet) router.replace('/onboarding');
  }, [pet, loading, router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <span className="text-body-ui text-ink-mute">…</span>
        </div>
      </AppShell>
    );
  }
  if (!pet) return null;

  return (
    <AppShell>
      {/* 装饰层 1：低透明度飘动 SVG（云 / 月 / 爪印 / 轨迹），按当前路由切换 */}
      <DecorBackground />

      {/* 装饰层 2：粒子（22 个慢慢上升的微暖光点） */}
      <Particles />

      {/* 内容层：z-10 浮在装饰之上 */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {children}
      </main>

      {/* TabBar：bg-page 不透明，自然遮住背后装饰，无需 z-index */}
      <TabBar />
    </AppShell>
  );
}
