'use client';

/**
 * 调试种子页：一键写入示例数据，用于阶段 D 验收。
 *
 * 用法：浏览器开 /seed → 选只宠物 → 点「写入示例数据」 →
 *      去 /notebook 看到 5 张复盘卡，去 /curve 看到 7 天折线。
 *
 * 上线前可加 `process.env.NODE_ENV === 'production'` 判断屏蔽。
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { resetAllData, type PetType } from '@/lib/db';
import { seedDemoData } from '@/lib/seed';
import { cn } from '@/lib/utils';

export default function SeedPage() {
  const [pet, setPet] = useState<PetType>('cat');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSeed = async () => {
    setBusy(true);
    setStatus('正在写入…');
    try {
      const r = await seedDemoData(pet);
      setStatus(
        `✅ 已写入 ${r.messages} 条对话 + ${r.emotions} 条情绪 + ${r.reviews} 张复盘` +
          (r.petCreated ? `（已默认选中：${pet === 'cat' ? '栖栖' : '迟迟'}）` : ''),
      );
    } catch (e) {
      setStatus('❌ 失败：' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('确认清空所有本地数据？')) return;
    setBusy(true);
    setStatus('正在清空…');
    try {
      await resetAllData();
      setStatus('✅ 已清空，下次进 / 会回到引导');
    } catch (e) {
      setStatus('❌ 失败：' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-10">
      <h1 className="text-h1 text-ink">🧪 阶段 D 测试种子</h1>

      <p className="max-w-sm text-center text-body-em font-light leading-relaxed text-ink-soft">
        一键给 IndexedDB 灌入示例数据：
        <br />
        <span className="text-caption text-ink-mute">
          12 条情绪（覆盖 7 天，含 1 天断档）
          <br />
          5 张复盘卡片（含字段完整 / 部分 / 极简三档）
        </span>
      </p>

      {/* 选宠物（若已有 settings 会被自动跳过） */}
      <div className="flex gap-2">
        {(['cat', 'dog'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPet(p)}
            aria-pressed={pet === p}
            className={cn(
              'inline-flex h-9 items-center rounded-pill px-4 text-body-ui transition-colors',
              pet === p
                ? 'bg-brand text-ink-on'
                : 'bg-brand-soft text-chip-warm',
            )}
          >
            {p === 'cat' ? '🐱 栖栖' : '🐶 迟迟'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button onClick={handleSeed} disabled={busy} fullWidth>
          写入示例数据
        </Button>
        <Button
          onClick={handleReset}
          variant="secondary"
          disabled={busy}
          fullWidth
        >
          清空所有数据
        </Button>
      </div>

      {status && (
        <p className="text-center text-caption text-ink-soft">{status}</p>
      )}

      <div className="flex gap-4 pt-2 text-caption">
        <Link href="/chat" className="text-brand hover:underline">
          → 聊天
        </Link>
        <Link href="/notebook" className="text-brand hover:underline">
          → 小本本
        </Link>
        <Link href="/curve" className="text-brand hover:underline">
          → 曲线
        </Link>
        <Link href="/settings" className="text-brand hover:underline">
          → 我
        </Link>
      </div>

      <p className="mt-4 max-w-sm text-center text-mini text-ink-mute">
        提示：调用本页会清空消息 / 情绪 / 复盘 3 张表（settings 保留）。
        <br />
        正式使用前请到 <code>/reset</code> 完全清空再重新引导。
      </p>
    </main>
  );
}
