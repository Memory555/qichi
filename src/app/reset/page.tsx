'use client';

/**
 * 调试路由：访问 /reset 清空所有本地数据并回到引导页。
 *
 * 用途：开发期重选宠物 / 重跑流程 / 测试空态。
 * 注意：会清掉 messages / emotions / reviews / settings 四张表，不可恢复。
 *
 * 上线前可考虑：
 *  - 加 `process.env.NODE_ENV === 'production'` 判断屏蔽
 *  - 或挪到设置页"清除所有数据"按钮（阶段 F 接入）
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetAllData } from '@/lib/db';

export default function ResetPage() {
  const router = useRouter();
  const [status, setStatus] = useState('正在清除…');

  useEffect(() => {
    resetAllData()
      .then(() => {
        setStatus('已清除，回到开始…');
        // 留 500ms 给用户看到提示再跳
        setTimeout(() => router.replace('/onboarding'), 500);
      })
      .catch((e) => {
        console.error('[reset] failed', e);
        setStatus('清除失败：' + (e as Error).message);
      });
  }, [router]);

  return (
    <main className="app-shell flex min-h-dvh items-center justify-center px-6">
      <p className="text-body-em font-light text-ink-soft">{status}</p>
    </main>
  );
}
