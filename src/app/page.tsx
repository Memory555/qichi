'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentPet } from '@/hooks/useCurrentPet';

/**
 * 路由分发：
 * - 加载中 → 显示静默 loading
 * - 无宠物 → 推到 /onboarding
 * - 有宠物 → 推到 /chat
 */
export default function Page() {
  const router = useRouter();
  const { pet, loading } = useCurrentPet();

  useEffect(() => {
    if (loading) return;
    router.replace(pet ? '/chat' : '/onboarding');
  }, [pet, loading, router]);

  return (
    <main className="app-shell flex min-h-dvh items-center justify-center">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:200ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:400ms]" />
      </div>
    </main>
  );
}
